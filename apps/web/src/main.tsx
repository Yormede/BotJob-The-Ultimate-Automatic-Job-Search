import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

type User = {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};
type DashboardData = {
  stats: Record<string, number>;
  recentApplications: Application[];
  nextActions: Array<{ id: string; label: string; company: string; jobTitle: string }>;
};
type Application = {
  id: string;
  company: string;
  jobTitle: string;
  offerUrl?: string | null;
  fullOfferText?: string;
  locationLabel?: string | null;
  contractType?: string | null;
  status: string;
  appliedAt?: string | null;
  lastAction?: string | null;
  nextAction?: string | null;
};
type ApplicationEvent = {
  id: string;
  eventType: string;
  label: string;
  state: string;
  author: string;
  eventAt?: string | null;
  createdAt: string;
};
type GeneratedDocument = {
  id: string;
  kind: "cv" | "cover_letter" | "approach_message";
  templateId?: string | null;
  version: number;
  title: string;
  contentText: string;
  isAtsOneColumn: boolean;
  generatedAt: string;
};
type Template = {
  id: string;
  kind: "cv" | "cover_letter";
  name: string;
  description: string;
  htmlContent?: string | null;
  cssContent?: string | null;
  isAtsOneColumn: boolean;
  isDefault: boolean;
};
type JobAxis = {
  id: string;
  title: string;
  description: string;
  contractTypes: string[];
  locations: Array<{ label?: string }>;
  priority: number;
  isActive: boolean;
};
type AiProfile = {
  sections: Record<string, unknown>;
  customInstructions: string;
  lifeTrace: unknown[];
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Brouillon",
  sent: "Envoyee",
  follow_up: "Relance",
  interview: "Entretien",
  accepted: "Acceptee",
  rejected: "Refusee",
  archived: "Archivee",
};

const DOCUMENT_LABELS: Record<GeneratedDocument["kind"], string> = {
  cv: "CV",
  cover_letter: "Lettre",
  approach_message: "Message",
};

const APPLICATION_COLUMNS = [
  ["location", "Lieu"],
  ["status", "Statut"],
  ["action", "Action"],
] as const;

const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:3000";

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: init?.body ? { "content-type": "application/json", ...init?.headers } : init?.headers,
    ...init,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "Erreur API");
  return data;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [route, setRoute] = useState(location.pathname);
  const [error, setError] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  useEffect(() => {
    api<{ user: User | null }>("/api/auth/session")
      .then((data) => setUser(data.user))
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    const onPop = () => setRoute(location.pathname);
    addEventListener("popstate", onPop);
    return () => removeEventListener("popstate", onPop);
  }, []);

  function go(path: string) {
    history.pushState(null, "", path);
    setRoute(path);
    setError("");
  }

  async function submitAuth(form: HTMLFormElement, mode: "login" | "register") {
    const fields = Object.fromEntries(new FormData(form));
    const payload =
      mode === "login"
        ? { login: fields.login, password: fields.password }
        : fields;

    const data = await api<{ user: User; verificationCode?: string }>(`/api/auth/${mode}`, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (mode === "register") {
      setPendingEmail(String(fields.email || ""));
      setVerificationCode(data.verificationCode || "");
      go("/verify-email");
      return;
    }

    setUser(data.user);
    go("/dashboard");
  }

  async function submitVerification(form: HTMLFormElement) {
    const fields = Object.fromEntries(new FormData(form));
    const data = await api<{ user: User }>("/api/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ email: fields.email, code: fields.code }),
    });
    setUser(data.user);
    setVerificationCode("");
    go("/dashboard");
  }

  async function resendVerification() {
    const email = pendingEmail.trim();
    if (!email) throw new Error("email requis");
    const data = await api<{ verificationCode?: string; alreadyVerified?: boolean }>("/api/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    setVerificationCode(data.verificationCode || "");
    setError(data.alreadyVerified ? "Email deja verifie, vous pouvez vous connecter." : "");
  }

  async function logout() {
    await api("/api/auth/logout", { method: "POST" });
    setUser(null);
    go("/login");
  }

  if (route === "/register") {
    return (
      <AuthShell
        mode="register"
        title="Creer votre espace BotJob"
        subtitle="Configurez votre identite et votre premiere session privee."
        switchLabel="Deja inscrit ? Se connecter"
        onSwitch={() => go("/login")}
      >
        <AuthForm
          error={error}
          mode="register"
          onSubmit={(form) => submitAuth(form, "register").catch((e) => setError(e.message))}
        />
      </AuthShell>
    );
  }

  if (route === "/verify-email") {
    return (
      <AuthShell
        mode="verify"
        title="Verifiez votre email"
        subtitle="Saisissez le code recu pour activer votre espace BotJob."
        switchLabel="Retour a la connexion"
        onSwitch={() => go("/login")}
      >
        <VerifyEmailForm
          email={pendingEmail}
          error={error}
          verificationCode={verificationCode}
          onResend={() => resendVerification().catch((e) => setError(e.message))}
          onSubmit={(form) => submitVerification(form).catch((e) => setError(e.message))}
        />
      </AuthShell>
    );
  }

  if (!user) {
    return (
      <AuthShell
        mode="login"
        title="Bon retour sur BotJob"
        subtitle="Connectez-vous a votre espace prive."
        switchLabel="Pas encore de compte ? Creer un compte"
        onSwitch={() => go("/register")}
      >
        <AuthForm
          error={error}
          mode="login"
          onSubmit={(form) => submitAuth(form, "login").catch((e) => setError(e.message))}
        />
      </AuthShell>
    );
  }

  return <Dashboard user={user} onLogout={logout} />;
}

function AuthShell(props: {
  mode: "login" | "register" | "verify";
  title: string;
  subtitle: string;
  switchLabel: string;
  onSwitch: () => void;
  children: React.ReactNode;
}) {
  return (
    <main className={`auth-page auth-page-${props.mode}`}>
      <section className="brand-panel">
        <div className="brand-row">
          <span className="brand-mark">B</span>
          <strong>BotJob</strong>
        </div>
        <div className="brand-copy">
          <h1>Creez. Personnalisez. Postulez. Suivez.</h1>
          <p>La suite privee pour generer des CV ATS, lettres de motivation, messages d'approche et suivre vos candidatures.</p>
        </div>
        <div className="pipeline-preview" aria-label="Parcours BotJob">
          {["Offre", "CV ATS", "Lettre", "Suivi"].map((item) => (
            <article key={item}>
              <span className="line-icon"></span>
              <strong>{item}</strong>
              <small>{item === "Offre" ? "Analyse ciblee" : item === "Suivi" ? "Historique clair" : "Rendu controlable"}</small>
            </article>
          ))}
        </div>
        <p className="trust-note">Vos donnees sont chiffrees et restent 100% privees.</p>
      </section>
      <section className="auth-panel">
        <h2>{props.title}</h2>
        <p className="panel-subtitle">{props.subtitle}</p>
        {props.children}
        <button className="link-button" onClick={props.onSwitch}>{props.switchLabel}</button>
      </section>
    </main>
  );
}

function VerifyEmailForm(props: {
  email: string;
  error: string;
  verificationCode: string;
  onSubmit: (form: HTMLFormElement) => void;
  onResend: () => void;
}) {
  return (
    <form
      className="auth-form"
      onSubmit={(event) => {
        event.preventDefault();
        props.onSubmit(event.currentTarget);
      }}
    >
      <Field name="email" type="email" placeholder="Email" defaultValue={props.email} />
      <Field name="code" placeholder="Code a 6 chiffres" minLength={6} maxLength={6} />
      {props.verificationCode && <p className="dev-code">Code de test : {props.verificationCode}</p>}
      {props.error && <p className="error">{props.error}</p>}
      <button type="submit">Verifier mon email</button>
      <button className="provider-button" type="button" onClick={props.onResend}>Renvoyer le code</button>
    </form>
  );
}

function AuthForm(props: {
  mode: "login" | "register";
  error: string;
  onSubmit: (form: HTMLFormElement) => void;
}) {
  return (
    <form
      className="auth-form"
      onSubmit={(event) => {
        event.preventDefault();
        props.onSubmit(event.currentTarget);
      }}
    >
      {props.mode === "register" ? (
        <>
          <div className="split">
            <Field name="firstName" placeholder="Prenom" />
            <Field name="lastName" placeholder="Nom" />
          </div>
          <Field name="username" placeholder="Nom d'utilisateur" />
          <Field name="email" type="email" placeholder="Email" />
          <div className="split">
            <label className="field">
              <span>Indicatif</span>
              <select name="phoneCountryCode" defaultValue="+33">
                <option value="+33">France +33</option>
                <option value="+32">Belgique +32</option>
                <option value="+41">Suisse +41</option>
                <option value="+1">Canada/USA +1</option>
              </select>
            </label>
            <Field name="phoneNumber" placeholder="Telephone" />
          </div>
          <Field name="password" type="password" placeholder="Mot de passe" minLength={8} />
        </>
      ) : (
        <>
          <Field name="login" placeholder="Email ou nom d'utilisateur" />
          <Field name="password" type="password" placeholder="Mot de passe" />
        </>
      )}
      {props.error && <p className="error">{props.error}</p>}
      <button type="submit">{props.mode === "login" ? "Se connecter" : "Creer mon espace"}</button>
      {props.mode === "login" && (
        <>
          <div className="divider">ou</div>
          <button className="provider-button" type="button">Continuer avec Google</button>
          <button className="provider-button" type="button">Continuer avec Apple</button>
        </>
      )}
    </form>
  );
}

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { name: string }) {
  return (
    <label className="field">
      <span>{props.placeholder}</span>
      <input {...props} required={props.required ?? true} />
    </label>
  );
}

function Dashboard(props: { user: User; onLogout: () => void }) {
  const [view, setView] = useState<"dashboard" | "create" | "applications" | "studio" | "settings">("dashboard");
  const [assistantPrompt, setAssistantPrompt] = useState("");
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobAxes, setJobAxes] = useState<JobAxis[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [aiProfile, setAiProfile] = useState<AiProfile | null>(null);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [applicationEvents, setApplicationEvents] = useState<ApplicationEvent[]>([]);
  const [generatedDocuments, setGeneratedDocuments] = useState<GeneratedDocument[]>([]);
  const [applicationQuery, setApplicationQuery] = useState("");
  const [applicationStatusFilter, setApplicationStatusFilter] = useState("all");
  const [visibleApplicationColumns, setVisibleApplicationColumns] = useState(() => new Set(APPLICATION_COLUMNS.map(([key]) => key)));
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Collez une offre et je vous aide a structurer une candidature dans votre suivi.",
    },
  ]);
  const [cvPreview, setCvPreview] = useState(generateDemoCv(props.user, "Developpeur Full Stack"));

  useEffect(() => {
    loadPrivateData().catch((error) => setNotice(error.message)).finally(() => setLoading(false));
  }, []);

  async function loadPrivateData() {
    const [dashboardData, applicationsData, axesData, profileData, templatesData] = await Promise.all([
      api<{ dashboard: DashboardData }>("/api/dashboard"),
      api<{ applications: Application[] }>("/api/applications"),
      api<{ jobAxes: JobAxis[] }>("/api/job-axes"),
      api<{ profile: AiProfile | null }>("/api/ai-profile"),
      api<{ templates: Template[] }>("/api/templates"),
    ]);
    setDashboard(dashboardData.dashboard);
    setApplications(applicationsData.applications);
    setJobAxes(axesData.jobAxes);
    setAiProfile(profileData.profile);
    setTemplates(templatesData.templates);
  }

  async function selectApplication(id: string) {
    setSelectedApplicationId(id);
    await Promise.all([loadApplicationEvents(id), loadGeneratedDocuments(id)]);
  }

  async function loadApplicationEvents(id: string) {
    const data = await api<{ events: ApplicationEvent[] }>(`/api/applications/${id}/events`);
    setApplicationEvents(data.events);
  }

  async function loadGeneratedDocuments(id: string) {
    const data = await api<{ documents: GeneratedDocument[] }>(`/api/applications/${id}/documents`);
    setGeneratedDocuments(data.documents);
  }

  function askAssistant() {
    const prompt = assistantPrompt.trim();
    if (!prompt) return;

    const target = inferTarget(prompt);
    setCvPreview(generateDemoCv(props.user, target));
    setMessages((current) => [
      ...current,
      { role: "user", content: prompt },
      {
        role: "assistant",
        content:
          "J'ai prepare un apercu CV de demonstration. Pour enregistrer cette opportunite, utilisez Creation rapide.",
      },
    ]);
    setAssistantPrompt("");
  }

  async function createApplication(form: HTMLFormElement) {
    const generationPayload = generationPayloadFromForm(form);
    const data = await api<{ application: Application }>("/api/applications", {
      method: "POST",
      body: JSON.stringify(applicationPayload(form)),
    });
    let generatedCount = 0;
    if (generationPayload.includeCv || generationPayload.includeCoverLetter || generationPayload.includeApproachMessage) {
      const generated = await api<{ documents: GeneratedDocument[] }>(`/api/applications/${data.application.id}/generate`, {
        method: "POST",
        body: JSON.stringify(generationPayload),
      });
      generatedCount = generated.documents.length;
    }
    form.reset();
    setNotice(generatedCount ? `Candidature enregistree. ${generationNotice(generatedCount)}` : "Candidature enregistree.");
    setSelectedApplicationId(data.application.id);
    await Promise.all([loadApplicationEvents(data.application.id), loadGeneratedDocuments(data.application.id)]);
    await loadPrivateData();
    setView("applications");
  }

  async function updateApplication(form: HTMLFormElement, application: Application) {
    const data = await api<{ application: Application }>(`/api/applications/${application.id}`, {
      method: "PATCH",
      body: JSON.stringify(applicationPayload(form)),
    });
    setNotice("Candidature mise a jour.");
    setSelectedApplicationId(data.application.id);
    await Promise.all([loadApplicationEvents(data.application.id), loadGeneratedDocuments(data.application.id)]);
    await loadPrivateData();
  }

  async function deleteApplication(application: Application) {
    await api(`/api/applications/${application.id}`, { method: "DELETE" });
    setNotice("Candidature supprimee.");
    setSelectedApplicationId(null);
    setApplicationEvents([]);
    setGeneratedDocuments([]);
    await loadPrivateData();
  }

  async function createApplicationEvent(form: HTMLFormElement, application: Application) {
    const fields = Object.fromEntries(new FormData(form));
    await api(`/api/applications/${application.id}/events`, {
      method: "POST",
      body: JSON.stringify({
        eventType: fields.eventType || "note",
        label: fields.label,
        state: "active",
      }),
    });
    form.reset();
    setNotice("Action ajoutee.");
    await loadApplicationEvents(application.id);
    await loadPrivateData();
  }

  async function generateDocuments(application: Application, form: HTMLFormElement) {
    const data = await api<{ documents: GeneratedDocument[] }>(`/api/applications/${application.id}/generate`, {
      method: "POST",
      body: JSON.stringify(generationPayloadFromForm(form)),
    });
    setNotice(generationNotice(data.documents.length));
    await loadGeneratedDocuments(application.id);
  }

  async function copyDocument(generatedDocument: GeneratedDocument) {
    await navigator.clipboard.writeText(generatedDocument.contentText);
    setNotice("Document copie.");
  }

  function downloadDocument(generatedDocument: GeneratedDocument) {
    const link = document.createElement("a");
    const file = new Blob([generatedDocument.contentText], { type: "text/plain;charset=utf-8" });
    link.href = URL.createObjectURL(file);
    link.download = `${slugify(generatedDocument.title)}-v${generatedDocument.version}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
    setNotice("Telechargement prepare.");
  }

  async function createJobAxis(form: HTMLFormElement) {
    const fields = Object.fromEntries(new FormData(form));
    await api("/api/job-axes", {
      method: "POST",
      body: JSON.stringify({
        title: fields.title,
        description: fields.description || "",
        contractTypes: String(fields.contractTypes || "").split(",").map((item) => item.trim()).filter(Boolean),
        locations: String(fields.locations || "").split(",").map((label) => ({ label: label.trim() })).filter((item) => item.label),
        priority: Number(fields.priority || 0),
      }),
    });
    form.reset();
    setNotice("Axe de recherche ajoute.");
    await loadPrivateData();
  }

  async function saveAiProfile(form: HTMLFormElement) {
    const fields = Object.fromEntries(new FormData(form));
    await api("/api/ai-profile", {
      method: "PUT",
      body: JSON.stringify({
        sections: { profile: fields.profile || "" },
        customInstructions: fields.customInstructions || "",
        lifeTrace: aiProfile?.lifeTrace ?? [],
      }),
    });
    setNotice("Profil IA mis a jour.");
    await loadPrivateData();
  }

  async function createTemplate(form: HTMLFormElement) {
    const fields = Object.fromEntries(new FormData(form));
    await api("/api/templates", {
      method: "POST",
      body: JSON.stringify({
        kind: fields.kind,
        name: fields.name,
        description: fields.description || "",
        htmlContent: fields.htmlContent || null,
        cssContent: fields.cssContent || null,
        isAtsOneColumn: fields.isAtsOneColumn === "on",
        isDefault: fields.isDefault === "on",
      }),
    });
    form.reset();
    await loadPrivateData();
    setNotice("Template ajoute.");
  }

  async function deleteTemplate(template: Template) {
    await api(`/api/templates/${template.id}`, { method: "DELETE" });
    await loadPrivateData();
    setNotice("Template supprime.");
  }

  const visibleApplications = applications.filter((application) => {
    const query = applicationQuery.trim().toLowerCase();
    const values = [
      application.company,
      application.jobTitle,
      application.locationLabel ?? "",
      application.contractType ?? "",
      application.status,
      application.nextAction ?? "",
      application.lastAction ?? "",
    ].map((value) => value.toLowerCase());
    const matchesQuery = !query || values.some((value) => value.includes(query));
    const matchesStatus = applicationStatusFilter === "all" || application.status === applicationStatusFilter;
    return matchesQuery && matchesStatus;
  });
  const hasApplicationFilters = applicationQuery.trim() !== "" || applicationStatusFilter !== "all";
  const selectedApplication =
    visibleApplications.find((application) => application.id === selectedApplicationId) ??
    visibleApplications[0] ??
    (hasApplicationFilters ? null : applications[0] ?? null);

  useEffect(() => {
    if (view !== "applications") return;
    if (!selectedApplication?.id) {
      setApplicationEvents([]);
      setGeneratedDocuments([]);
      return;
    }
    Promise.all([loadApplicationEvents(selectedApplication.id), loadGeneratedDocuments(selectedApplication.id)])
      .catch((error) => setNotice(error.message));
  }, [view, selectedApplication?.id]);

  return (
    <main className="dashboard">
      <aside className="sidebar">
        <div className="brand-row"><span className="brand-mark">B</span><strong>BotJob</strong></div>
        <nav>
          <button className={view === "dashboard" ? "active" : ""} onClick={() => setView("dashboard")}>Dashboard</button>
          <button className={view === "create" ? "active" : ""} onClick={() => setView("create")}>Creer</button>
          <button className={view === "applications" ? "active" : ""} onClick={() => setView("applications")}>Candidatures</button>
          <button className={view === "studio" ? "active" : ""} onClick={() => setView("studio")}>Studio IA</button>
          <button className={view === "settings" ? "active" : ""} onClick={() => setView("settings")}>Settings</button>
        </nav>
        <p className="trust-note">L'assistant gere ce qui est autorise, jamais vos donnees sensibles.</p>
      </aside>

      <section className="dashboard-main">
        <header className="topbar">
          <h1>Bonjour {props.user.firstName}</h1>
          <div>
            <span className="avatar">{props.user.firstName.slice(0, 1)}{props.user.lastName.slice(0, 1)}</span>
            <button onClick={props.onLogout}>Deconnexion</button>
          </div>
        </header>
        <nav className="mobile-nav" aria-label="Navigation mobile">
          <button className={view === "dashboard" ? "active" : ""} onClick={() => setView("dashboard")}>Dashboard</button>
          <button className={view === "create" ? "active" : ""} onClick={() => setView("create")}>Creer</button>
          <button className={view === "applications" ? "active" : ""} onClick={() => setView("applications")}>Candidatures</button>
          <button className={view === "studio" ? "active" : ""} onClick={() => setView("studio")}>Studio</button>
          <button className={view === "settings" ? "active" : ""} onClick={() => setView("settings")}>Settings</button>
        </nav>
        {notice && <p className="notice">{notice}</p>}
        {loading ? <p className="notice">Chargement...</p> : null}

        {view === "dashboard" && <div className="dashboard-grid">
          <section className="assistant-panel">
            <p className="eyebrow">Assistant IA</p>
            <h2>Bon retour {props.user.firstName}</h2>
            <p>Je peux vous aider a creer des candidatures, relancer vos contacts et optimiser votre suivi.</p>
            <div className="assistant-chat" aria-label="Conversation assistant">
              {messages.map((message, index) => (
                <article className={`chat-bubble ${message.role}`} key={`${message.role}-${index}`}>
                  {message.content}
                </article>
              ))}
            </div>
            <div className="quick-actions">
              <button onClick={() => setView("create")}>Creer une candidature</button>
              <button onClick={() => setView("applications")}>Voir mes prochaines actions</button>
              <button onClick={() => setView("studio")}>Optimiser mon profil</button>
            </div>
            <label className="assistant-input">
              <input
                placeholder="Collez une offre ou posez une question..."
                value={assistantPrompt}
                onChange={(event) => setAssistantPrompt(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") askAssistant();
                }}
              />
              <button onClick={askAssistant}>Envoyer</button>
            </label>
          </section>

          <section className="stats-panel">
            <PanelTitle title="Candidatures ce mois" action="Configurer" onAction={() => setView("studio")} />
            <div className="stat-grid">
              {[
                [dashboard?.stats.total ?? 0, "Candidatures"],
                [dashboard?.stats.interview ?? 0, "Entretiens"],
                [dashboard?.stats.followUp ?? 0, "A relancer"],
                [dashboard?.stats.sent ?? 0, "Envoyees"],
              ].map(([value, label]) => (
                <article key={label}>
                  <strong>{value}</strong>
                  <span>{label}</span>
                </article>
              ))}
            </div>
          </section>

          <section className="creation-panel">
            <PanelTitle title="Creation rapide CV" />
            <div className="creation-actions">
              <button onClick={() => setView("create")}>CV ATS 1 colonne</button>
              <button onClick={() => setView("create")}>Lettre de motivation</button>
              <button onClick={() => setView("create")}>Message d'approche</button>
            </div>
            <div className="cv-preview" dangerouslySetInnerHTML={{ __html: cvPreview }} />
          </section>

          <section className="axes-panel">
            <PanelTitle title="Axes de recherche" action="Modifier" onAction={() => setView("studio")} />
            {jobAxes.length ? jobAxes.map((axis) => (
              <p key={axis.id}>{axis.title} - {axis.contractTypes.join(", ") || "Contrat libre"}</p>
            )) : <p>Aucun axe configure.</p>}
          </section>

          <section className="recent-panel">
            <PanelTitle title="Candidatures recentes" action="Voir tout" onAction={() => setView("applications")} />
            {applications.slice(0, 5).map((application) => (
              <button className="job-row" key={application.id} onClick={() => selectApplication(application.id).catch((error) => setNotice(error.message))}>
                <span className="doc-icon"></span>
                <div>
                  <strong>{application.jobTitle}</strong>
                  <small>{application.company}</small>
                </div>
                <em>{statusLabel(application.status)}</em>
              </button>
            ))}
            {!applications.length && <p className="empty">Aucune candidature enregistree.</p>}
          </section>
        </div>}

        {view === "create" && (
          <section className="create-workspace">
            <section className="workspace-panel create-form-panel">
              <PanelTitle title="Creer une candidature" action="Dashboard" onAction={() => setView("dashboard")} />
              <ApplicationForm jobAxes={jobAxes} onSubmit={(form) => createApplication(form).catch((error) => setNotice(error.message))}>
                <DocumentGenerationFields templates={templates} />
              </ApplicationForm>
            </section>
            <aside className="workspace-panel create-options-panel">
              <PanelTitle title="Options de generation" />
              <div className="create-option-list">
                <p><strong>CV ATS 1 colonne</strong><span>Structure lisible, sobre et compatible ATS.</span></p>
                <p><strong>Lettre de motivation</strong><span>Texte adapte a l'entreprise et a l'offre.</span></p>
                <p><strong>Message d'approche</strong><span>Premier contact court pour recruteur ou manager.</span></p>
              </div>
              <button onClick={() => {
                setAssistantPrompt("Aide-moi a analyser cette offre avant creation");
                setView("dashboard");
              }}>Preparer avec l'assistant</button>
            </aside>
            <section className="workspace-panel create-preview-panel">
              <PanelTitle title="Apercu document" />
              <div className="cv-preview" dangerouslySetInnerHTML={{ __html: cvPreview }} />
            </section>
          </section>
        )}

        {view === "applications" && (
          <section className="applications-view">
            <section className="workspace-panel">
              <PanelTitle title="Candidatures" action={`${visibleApplications.length}/${applications.length}`} />
              <div className="applications-toolbar">
                <input
                  aria-label="Rechercher une candidature"
                  placeholder="Rechercher entreprise, poste, lieu..."
                  value={applicationQuery}
                  onChange={(event) => setApplicationQuery(event.target.value)}
                />
                <select
                  aria-label="Filtrer par statut"
                  value={applicationStatusFilter}
                  onChange={(event) => setApplicationStatusFilter(event.target.value)}
                >
                  <option value="all">Tous les statuts</option>
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="column-toggles" aria-label="Colonnes affichees">
                {APPLICATION_COLUMNS.map(([key, label]) => (
                  <label key={key}>
                    <input
                      type="checkbox"
                      checked={visibleApplicationColumns.has(key)}
                      onChange={() => setVisibleApplicationColumns((current) => {
                        const next = new Set(current);
                        next.has(key) ? next.delete(key) : next.add(key);
                        return next;
                      })}
                    />
                    {label}
                  </label>
                ))}
              </div>
              <div className="application-list">
                {visibleApplications.map((application) => (
                  <button className={`application-card ${application.id === selectedApplication?.id ? "active" : ""}`} key={application.id} onClick={() => selectApplication(application.id).catch((error) => setNotice(error.message))}>
                    <div className="application-card-main">
                      <span className="doc-icon"></span>
                      <div>
                        <strong>{application.jobTitle}</strong>
                        <small>{application.company}{visibleApplicationColumns.has("location") ? ` - ${application.locationLabel || "Lieu non precise"}` : ""}</small>
                      </div>
                    </div>
                    {visibleApplicationColumns.has("status") && <span className={`status-pill status-${application.status}`}>{statusLabel(application.status)}</span>}
                    {visibleApplicationColumns.has("action") && <p>{application.nextAction || application.lastAction || "Aucune action enregistree."}</p>}
                  </button>
                ))}
                {!applications.length && <p className="empty">Creez votre premiere candidature depuis l'onglet Creer.</p>}
                {applications.length > 0 && !visibleApplications.length && <p className="empty">Aucune candidature ne correspond aux filtres.</p>}
              </div>
            </section>
            {selectedApplication && (
              <section className="workspace-panel application-detail">
                <div className="application-detail-hero">
                  <div>
                    <p className="eyebrow">Detail candidature</p>
                    <h2>{selectedApplication.company}</h2>
                    <p>{selectedApplication.jobTitle}</p>
                    <div className="detail-meta">
                      <span>{selectedApplication.locationLabel || "Lieu non precise"}</span>
                      <span>{selectedApplication.contractType || "Contrat non precise"}</span>
                      <span>{selectedApplication.appliedAt ? formatDate(selectedApplication.appliedAt) : "Non envoyee"}</span>
                    </div>
                  </div>
                  <span className={`status-pill status-${selectedApplication.status}`}>{statusLabel(selectedApplication.status)}</span>
                </div>
                <ApplicationForm
                  key={selectedApplication.id}
                  application={selectedApplication}
                  jobAxes={jobAxes}
                  submitLabel="Mettre a jour"
                  onSubmit={(form) => updateApplication(form, selectedApplication).catch((error) => setNotice(error.message))}
                />
                <div className="detail-columns">
                  <section>
                  <PanelTitle title="Documents generes" />
                  <form className="document-options" onSubmit={(event) => {
                    event.preventDefault();
                    generateDocuments(selectedApplication, event.currentTarget).catch((error) => setNotice(error.message));
                  }}>
                    <DocumentGenerationFields templates={templates} />
                    <button type="submit">Generer</button>
                  </form>
                    <div className="document-list">
                      {generatedDocuments.map((document) => (
                        <article key={document.id}>
                          <strong>{document.title}</strong>
                          <small>{DOCUMENT_LABELS[document.kind]} v{document.version} - {document.isAtsOneColumn ? "ATS 1 colonne" : "Structure flexible"} - {formatDate(document.generatedAt)}</small>
                          <div className="document-actions">
                            <button onClick={() => copyDocument(document).catch((error) => setNotice(error.message))}>Copier</button>
                            <button onClick={() => downloadDocument(document)}>Telecharger .txt</button>
                          </div>
                          <pre>{document.contentText}</pre>
                        </article>
                      ))}
                      {!generatedDocuments.length && <p className="empty">Aucun document genere.</p>}
                    </div>
                  </section>
                  <aside>
                    <PanelTitle title="Actions" />
                    <ApplicationEventForm onSubmit={(form) => createApplicationEvent(form, selectedApplication).catch((error) => setNotice(error.message))} />
                    <div className="event-list">
                      {applicationEvents.map((event) => (
                        <p key={event.id}>
                          <span>{statusLabel(event.eventType)}</span>
                          {event.label}
                          <small>{formatDate(event.createdAt)}</small>
                        </p>
                      ))}
                      {!applicationEvents.length && <p className="empty">Aucune action historisee.</p>}
                    </div>
                    <button className="danger-button" onClick={() => deleteApplication(selectedApplication).catch((error) => setNotice(error.message))}>Supprimer la candidature</button>
                  </aside>
                </div>
              </section>
            )}
          </section>
        )}

        {view === "studio" && (
          <section className="studio-view">
            <section className="studio-hero">
              <div>
                <p className="eyebrow">Studio IA</p>
                <h2>Profil, axes et templates</h2>
                <p>Centralisez les donnees qui guident les generations : votre profil maitre, vos cibles de recherche et les modeles de documents.</p>
              </div>
              <div className="studio-metrics">
                <span>{jobAxes.filter((axis) => axis.isActive).length}<small>axes actifs</small></span>
                <span>{templates.length}<small>templates</small></span>
              </div>
            </section>
            <section className="settings-grid studio-grid">
              <section className="workspace-panel">
                <PanelTitle title="Axes de recherche" />
                <JobAxisForm onSubmit={(form) => createJobAxis(form).catch((error) => setNotice(error.message))} />
              </section>
              <section className="workspace-panel">
                <PanelTitle title="Profil IA" />
                <AiProfileForm profile={aiProfile} onSubmit={(form) => saveAiProfile(form).catch((error) => setNotice(error.message))} />
              </section>
              <section className="workspace-panel">
                <PanelTitle title="Templates" />
                <TemplateForm onSubmit={(form) => createTemplate(form).catch((error) => setNotice(error.message))} />
                <div className="template-list">
                  {templates.map((template) => (
                    <article key={template.id}>
                      <div>
                        <strong>{template.name}</strong>
                        <small>{template.kind === "cv" ? "CV" : "Lettre"}{template.isDefault ? " - defaut" : ""}</small>
                      </div>
                      <button type="button" onClick={() => deleteTemplate(template).catch((error) => setNotice(error.message))}>Supprimer</button>
                    </article>
                  ))}
                  {!templates.length && <p className="empty">Aucun template enregistre.</p>}
                </div>
              </section>
            </section>
          </section>
        )}

        {view === "settings" && (
          <section className="settings-grid">
            <section className="workspace-panel">
              <PanelTitle title="Compte" />
              <div className="settings-summary">
                <p><strong>{props.user.firstName} {props.user.lastName}</strong></p>
                <p>{props.user.email}</p>
                <p>Session serveur active avec cookie HttpOnly.</p>
              </div>
            </section>
            <section className="workspace-panel">
              <PanelTitle title="Securite" />
              <div className="settings-summary">
                <p>Email verifie par code en V1.</p>
                <p>Les donnees privees restent filtrees par utilisateur cote API.</p>
              </div>
            </section>
          </section>
        )}
      </section>
    </main>
  );
}

function ApplicationForm(props: {
  application?: Application;
  jobAxes: JobAxis[];
  submitLabel?: string;
  children?: React.ReactNode;
  onSubmit: (form: HTMLFormElement) => void;
}) {
  const application = props.application;
  return (
    <form className="resource-form" onSubmit={(event) => { event.preventDefault(); props.onSubmit(event.currentTarget); }}>
      <div className="split">
        <Field name="company" placeholder="Entreprise" defaultValue={application?.company} />
        <Field name="jobTitle" placeholder="Poste" defaultValue={application?.jobTitle} />
      </div>
      <div className="split">
        <label className="field">
          <span>Axe</span>
          <select name="jobAxisId">
            <option value="">Aucun axe</option>
            {props.jobAxes.map((axis) => <option key={axis.id} value={axis.id}>{axis.title}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Statut</span>
          <select name="status" defaultValue={application?.status ?? "draft"}>
            <option value="draft">Brouillon</option>
            <option value="sent">Envoyee</option>
            <option value="follow_up">Relance</option>
            <option value="interview">Entretien</option>
            <option value="accepted">Acceptee</option>
            <option value="rejected">Refusee</option>
            <option value="archived">Archivee</option>
          </select>
        </label>
      </div>
      <div className="split">
        <Field name="locationLabel" placeholder="Lieu" required={false} defaultValue={application?.locationLabel ?? ""} />
        <Field name="contractType" placeholder="Contrat" required={false} defaultValue={application?.contractType ?? ""} />
      </div>
      <div className="split">
        <Field name="offerUrl" type="url" placeholder="URL de l'offre" required={false} defaultValue={application?.offerUrl ?? ""} />
        <Field name="appliedAt" type="date" placeholder="Date d'envoi" required={false} defaultValue={dateInputValue(application?.appliedAt)} />
      </div>
      <label className="field">
        <span>Annonce complete</span>
        <textarea name="fullOfferText" required placeholder="Collez l'annonce ici" defaultValue={application?.fullOfferText ?? ""} />
      </label>
      {props.children}
      <button type="submit">{props.submitLabel ?? "Enregistrer la candidature"}</button>
    </form>
  );
}

function DocumentGenerationFields(props: { templates: Template[] }) {
  return (
    <div className="document-options">
      <label><input name="includeCv" type="checkbox" defaultChecked /> CV</label>
      <select name="cvTemplateId" aria-label="Template CV">
        <option value="">Template CV par defaut</option>
        {props.templates.filter((template) => template.kind === "cv").map((template) => (
          <option key={template.id} value={template.id}>{template.name}</option>
        ))}
      </select>
      <label><input name="includeCoverLetter" type="checkbox" defaultChecked /> Lettre</label>
      <select name="coverLetterTemplateId" aria-label="Template lettre">
        <option value="">Template lettre par defaut</option>
        {props.templates.filter((template) => template.kind === "cover_letter").map((template) => (
          <option key={template.id} value={template.id}>{template.name}</option>
        ))}
      </select>
      <label><input name="includeApproachMessage" type="checkbox" defaultChecked /> Message</label>
      <label><input name="allowCvStructureChanges" type="checkbox" /> Autoriser structure CV flexible</label>
    </div>
  );
}

function ApplicationEventForm(props: { onSubmit: (form: HTMLFormElement) => void }) {
  return (
    <form className="resource-form compact-form" onSubmit={(event) => { event.preventDefault(); props.onSubmit(event.currentTarget); }}>
      <div className="split">
        <label className="field">
          <span>Type d'action</span>
          <select name="eventType" defaultValue="note">
            <option value="note">Note</option>
            <option value="last_action">Derniere action</option>
            <option value="next_action">Prochaine action</option>
            <option value="follow_up">Relance</option>
            <option value="interview">Entretien</option>
          </select>
        </label>
        <Field name="label" placeholder="Action ou note" />
      </div>
      <button type="submit">Ajouter l'action</button>
    </form>
  );
}

function JobAxisForm(props: { onSubmit: (form: HTMLFormElement) => void }) {
  return (
    <form className="resource-form" onSubmit={(event) => { event.preventDefault(); props.onSubmit(event.currentTarget); }}>
      <Field name="title" placeholder="Titre de l'axe" />
      <Field name="description" placeholder="Description" required={false} />
      <div className="split">
        <Field name="contractTypes" placeholder="Contrats separes par virgule" required={false} />
        <Field name="locations" placeholder="Lieux separes par virgule" required={false} />
      </div>
      <Field name="priority" type="number" min={0} placeholder="Priorite" required={false} />
      <button type="submit">Ajouter l'axe</button>
    </form>
  );
}

function AiProfileForm(props: { profile: AiProfile | null; onSubmit: (form: HTMLFormElement) => void }) {
  const profileText = String(props.profile?.sections?.profile ?? "");
  return (
    <form className="resource-form" onSubmit={(event) => { event.preventDefault(); props.onSubmit(event.currentTarget); }}>
      <label className="field">
        <span>Profil candidat</span>
        <textarea name="profile" defaultValue={profileText} placeholder="Experience, competences, objectifs..." />
      </label>
      <label className="field">
        <span>Consignes IA</span>
        <textarea name="customInstructions" defaultValue={props.profile?.customInstructions ?? ""} placeholder="Ton, contraintes, preferences..." />
      </label>
      <button type="submit">Sauvegarder le profil IA</button>
    </form>
  );
}

function TemplateForm(props: { onSubmit: (form: HTMLFormElement) => void }) {
  return (
    <form className="resource-form" onSubmit={(event) => { event.preventDefault(); props.onSubmit(event.currentTarget); }}>
      <div className="split">
        <label className="field">
          <span>Type</span>
          <select name="kind" defaultValue="cv">
            <option value="cv">CV</option>
            <option value="cover_letter">Lettre</option>
          </select>
        </label>
        <Field name="name" placeholder="Nom du template" />
      </div>
      <Field name="description" placeholder="Description" required={false} />
      <label className="field">
        <span>HTML</span>
        <textarea name="htmlContent" required={false} placeholder="<article>...</article>" />
      </label>
      <label className="field">
        <span>CSS</span>
        <textarea name="cssContent" required={false} placeholder="article { ... }" />
      </label>
      <div className="document-options">
        <label><input name="isAtsOneColumn" type="checkbox" defaultChecked /> ATS 1 colonne</label>
        <label><input name="isDefault" type="checkbox" /> Defaut</label>
      </div>
      <button type="submit">Ajouter le template</button>
    </form>
  );
}

function PanelTitle(props: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="panel-title">
      <h2>{props.title}</h2>
      {props.action && <button type="button" onClick={props.onAction}>{props.action}</button>}
    </div>
  );
}

function generateDemoCv(user: User, target: string) {
  const title = escapeHtml(target.replace(/^./, (letter) => letter.toUpperCase()));
  const firstName = escapeHtml(user.firstName);
  const lastName = escapeHtml(user.lastName);
  return `
    <article class="demo-cv">
      <header>
        <h3>${firstName} ${lastName}</h3>
        <p>${title} - React, TypeScript, Bun, PostgreSQL</p>
      </header>
      <section>
        <strong>Profil</strong>
        <p>Candidat fullstack oriente produit, capable de concevoir une application en couches, securiser les acces et livrer un MVP testable.</p>
      </section>
      <section>
        <strong>Experiences ciblees</strong>
        <ul>
          <li>Creation d'une API Bun TypeScript avec sessions serveur et repositories SQL.</li>
          <li>Conception PostgreSQL avec relations, contraintes, index et JSONB.</li>
          <li>Maquettage Figma et transformation des besoins en parcours utilisateur.</li>
        </ul>
      </section>
    </article>
  `;
}

function inferTarget(prompt: string) {
  const lowerPrompt = prompt.toLowerCase();
  if (lowerPrompt.includes("react") || lowerPrompt.includes("typescript")) return "Developpeur React TypeScript";
  if (lowerPrompt.includes("full stack") || lowerPrompt.includes("fullstack")) return "Developpeur Full Stack";
  if (lowerPrompt.includes("data")) return "Assistant Data";
  if (lowerPrompt.includes("ia") || lowerPrompt.includes("ai")) return "Developpeur IA";
  return "Poste cible";
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return entities[character];
  });
}

function applicationPayload(form: HTMLFormElement) {
  const fields = Object.fromEntries(new FormData(form));
  return {
    jobAxisId: fields.jobAxisId || null,
    company: fields.company,
    jobTitle: fields.jobTitle,
    offerUrl: fields.offerUrl || null,
    fullOfferText: fields.fullOfferText,
    locationLabel: fields.locationLabel || null,
    contractType: fields.contractType || null,
    status: fields.status || "draft",
    appliedAt: fields.appliedAt ? new Date(String(fields.appliedAt)).toISOString() : null,
  };
}

function generationPayloadFromForm(form: HTMLFormElement) {
  const fields = new FormData(form);
  return {
    includeCv: fields.has("includeCv"),
    includeCoverLetter: fields.has("includeCoverLetter"),
    includeApproachMessage: fields.has("includeApproachMessage"),
    cvTemplateId: fields.get("cvTemplateId") || null,
    coverLetterTemplateId: fields.get("coverLetterTemplateId") || null,
    allowCvStructureChanges: fields.has("allowCvStructureChanges"),
  };
}

function dateInputValue(value: string | null | undefined) {
  return value ? value.slice(0, 10) : "";
}

function statusLabel(status: string) {
  return STATUS_LABELS[status] ?? status.replace(/_/g, " ");
}

function formatDate(value: string | null | undefined) {
  return value ? new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value)) : "";
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function generationNotice(count: number) {
  return `${count} document${count > 1 ? "s" : ""} genere${count > 1 ? "s" : ""}.`;
}

createRoot(document.getElementById("root")!).render(<App />);
