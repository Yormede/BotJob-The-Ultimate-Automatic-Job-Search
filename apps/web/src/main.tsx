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

const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:3000";

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: { "content-type": "application/json", ...init?.headers },
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

    const data = await api<{ user: User }>(`/api/auth/${mode}`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setUser(data.user);
    go("/dashboard");
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

  if (!user || route === "/login" || route === "/") {
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
  mode: "login" | "register";
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
            <Field name="phoneNumber" placeholder="Telephone" />
            <Field name="password" type="password" placeholder="Mot de passe" minLength={8} />
          </div>
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
  const [assistantPrompt, setAssistantPrompt] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Collez une offre et je prepare une candidature de demonstration avec un CV HTML/CSS.",
    },
  ]);
  const [cvPreview, setCvPreview] = useState(generateDemoCv(props.user, "Developpeur Full Stack"));

  const recent = [
    ["Developpeur IA alternance", "Nova Labs", "En cours"],
    ["Frontend React", "Atelier Signal", "Relance"],
    ["Assistant data junior", "DataForge", "Envoyee"],
  ];

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
          "J'ai prepare un CV HTML/CSS de demonstration, une structure ATS 1 colonne et une accroche adaptee a l'offre. En V1 connectee, cette action creera aussi la candidature en base.",
      },
    ]);
    setAssistantPrompt("");
  }

  return (
    <main className="dashboard">
      <aside className="sidebar">
        <div className="brand-row"><span className="brand-mark">B</span><strong>BotJob</strong></div>
        <nav>
          {["Dashboard", "Creer CV/LDM/message", "Candidatures", "Studio IA", "Settings"].map((item) => (
            <a className={item === "Dashboard" ? "active" : ""} key={item}>{item}</a>
          ))}
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

        <div className="dashboard-grid">
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
              <button onClick={() => setAssistantPrompt("Cree un CV pour une offre React TypeScript")}>Creer une candidature</button>
              <button onClick={() => setAssistantPrompt("Quelles candidatures dois-je relancer ?")}>Voir mes prochaines actions</button>
              <button onClick={() => setAssistantPrompt("Optimise mon CV pour developpeur full stack")}>Optimiser mon CV</button>
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
            <PanelTitle title="Candidatures ce mois" action="Configurer" />
            <div className="stat-grid">
              {[
                ["24", "Candidatures"],
                ["6", "Entretiens"],
                ["8", "A relancer"],
                ["50%", "Taux de reponse"],
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
              <button>CV ATS 1 colonne</button>
              <button>Lettre de motivation</button>
              <button>Message d'approche</button>
            </div>
            <div className="cv-preview" dangerouslySetInnerHTML={{ __html: cvPreview }} />
          </section>

          <section className="axes-panel">
            <PanelTitle title="Axes de recherche" action="Modifier" />
            {["Developpeur Full Stack", "Lyon, Paris, Remote", "React, Bun, SQL, Docker"].map((item) => (
              <p key={item}>{item}</p>
            ))}
          </section>

          <section className="recent-panel">
            <PanelTitle title="Candidatures recentes" action="Voir tout" />
            {recent.map(([title, company, status]) => (
              <article className="job-row" key={title}>
                <span className="doc-icon"></span>
                <div>
                  <strong>{title}</strong>
                  <small>{company}</small>
                </div>
                <em>{status}</em>
              </article>
            ))}
          </section>
        </div>
      </section>
    </main>
  );
}

function PanelTitle(props: { title: string; action?: string }) {
  return (
    <div className="panel-title">
      <h2>{props.title}</h2>
      {props.action && <button>{props.action}</button>}
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

createRoot(document.getElementById("root")!).render(<App />);
