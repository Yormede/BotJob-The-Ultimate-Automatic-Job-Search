import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const htmlPath =
  "C:/Users/AhmiSVG/Downloads/site_suivi_candidatures_crud.html";
const campaignPath =
  "C:/Users/AhmiSVG/Downloads/autotrust/campaigns/hellowork-2026-06-16/applications.json";
const outputPath =
  "C:/Users/AhmiSVG/Downloads/candidatures_completes_ahmed_2026-06-18.json";

function normalizeText(value = "") {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function dateOnly(value) {
  return value ? String(value).slice(0, 10) : null;
}

function statusFamily(status = "") {
  const value = normalizeText(status);
  if (value.includes("entretien")) return "interview";
  if (value.includes("refus") || value.includes("rejected")) return "rejected";
  if (
    value.includes("blocked") ||
    value.includes("bloque") ||
    value.includes("needs finalization")
  ) {
    return "blocked";
  }
  if (
    value.includes("applied") ||
    value.includes("envoye") ||
    value.includes("en cours")
  ) {
    return "applied";
  }
  return "unknown";
}

function extractInitialData(html) {
  const match = html.match(
    /const initialData\s*=\s*({[\s\S]*?});\s*\n\s*let state/,
  );
  if (!match) {
    throw new Error("Impossible de trouver initialData dans le fichier HTML.");
  }
  return vm.runInNewContext(`(${match[1]})`);
}

function classifyHistoricFiles(files = []) {
  const cvFiles = files.filter((file) => /^cv[_-]/i.test(file));
  const messageFiles = files.filter((file) =>
    /^(message|mail)[_-]/i.test(file),
  );
  const ldmFiles = files.filter((file) => /^lettre[_-]/i.test(file));
  const classified = new Set([...cvFiles, ...messageFiles, ...ldmFiles]);
  const otherFiles = files.filter((file) => !classified.has(file));
  return { cvFiles, ldmFiles, messageFiles, otherFiles };
}

const html = fs.readFileSync(htmlPath, "utf8");
const historicData = extractInitialData(html);
const campaignData = JSON.parse(fs.readFileSync(campaignPath, "utf8"));

const historicApplications = historicData.candidatures.map((item, index) => {
  const files = classifyHistoricFiles(item.fichiers);
  return {
    applicationId: `historique-${String(index + 1).padStart(3, "0")}`,
    source: "Suivi historique HTML",
    sourceId: null,
    campaignIndex: null,
    status: item.statut,
    statusFamily: statusFamily(item.statut),
    applicationDate: item.date,
    appliedAt: item.date ? `${item.date}T00:00:00+02:00` : null,
    publicationDate: null,
    company: item.entreprise,
    title: item.poste,
    location: null,
    contract: null,
    salary: null,
    url: null,
    reference: null,
    cvFile: files.cvFiles[0] ?? null,
    cvFiles: files.cvFiles,
    ldmFile: files.ldmFiles[0] ?? null,
    ldmFiles: files.ldmFiles,
    messageFiles: files.messageFiles,
    otherFiles: files.otherFiles,
    allFiles: item.fichiers ?? [],
    confirmation: null,
    notes: item.notes ?? "",
    missions: "",
    profile: "",
    info: "",
    keywords: [],
    levels: [],
    sectors: [],
    detailFile: null,
    extractedAt: null,
    lastActionAt: null,
    originalData: item,
  };
});

const helloWorkApplications = campaignData.applications.map((item) => ({
  applicationId: `hellowork-${item.id ?? item.campaignIndex}`,
  source: item.source ?? "Hellowork",
  sourceId: item.id ?? null,
  campaignIndex: item.campaignIndex ?? null,
  status: item.status ?? "",
  statusFamily: statusFamily(item.status),
  applicationDate: dateOnly(item.appliedAt),
  appliedAt: item.appliedAt ?? null,
  publicationDate: item.publicationDate ?? null,
  company: item.company ?? "",
  title: item.title ?? "",
  location: item.location ?? null,
  contract: item.contract ?? null,
  salary: item.salary ?? null,
  url: item.url ?? null,
  reference: item.reference ?? null,
  cvFile: item.cvFile ?? null,
  cvFiles: item.cvFile ? [item.cvFile] : [],
  ldmFile: item.ldmFile ?? null,
  ldmFiles: item.ldmFile ? [item.ldmFile] : [],
  messageFiles: [],
  otherFiles: [],
  allFiles: [item.cvFile, item.ldmFile].filter(Boolean),
  confirmation: item.confirmation ?? null,
  notes: item.notes ?? "",
  missions: item.missions ?? "",
  profile: item.profile ?? "",
  info: item.info ?? "",
  keywords: item.keywords ?? [],
  levels: item.levels ?? [],
  sectors: item.sectors ?? [],
  detailFile: item.detailFile ?? null,
  extractedAt: item.extractedAt ?? null,
  lastActionAt: item.lastActionAt ?? null,
  originalData: item,
}));

const allApplications = [...historicApplications, ...helloWorkApplications];
const duplicateGroups = new Map();

for (const application of allApplications) {
  const key = [
    normalizeText(application.company),
    normalizeText(application.title),
    normalizeText(application.location ?? ""),
    application.applicationDate ?? "",
  ].join("|");
  const entries = duplicateGroups.get(key) ?? [];
  entries.push(application.applicationId);
  duplicateGroups.set(key, entries);
}

const possibleDuplicates = [...duplicateGroups.entries()]
  .filter(([, ids]) => ids.length > 1)
  .map(([key, applicationIds]) => ({ key, applicationIds }));

allApplications.sort((a, b) => {
  const dateComparison = (b.applicationDate ?? "").localeCompare(
    a.applicationDate ?? "",
  );
  if (dateComparison !== 0) return dateComparison;
  return a.company.localeCompare(b.company, "fr");
});

const statusCounts = Object.fromEntries(
  [...new Set(allApplications.map((item) => item.statusFamily))]
    .sort()
    .map((status) => [
      status,
      allApplications.filter((item) => item.statusFamily === status).length,
    ]),
);

const output = {
  schemaVersion: "1.0.0",
  generatedAt: new Date().toISOString(),
  candidate: historicData.candidat ?? {
    firstName: "Ahmed",
    lastName: "Khedimellah",
  },
  sources: [
    {
      type: "html_embedded_data",
      path: htmlPath,
      count: historicApplications.length,
      sourceLastUpdatedAt: historicData.date_derniere_maj ?? null,
    },
    {
      type: "hellowork_campaign_json",
      path: campaignPath,
      count: helloWorkApplications.length,
      campaign: campaignData.campaign ?? null,
    },
  ],
  statistics: {
    total: allApplications.length,
    historic: historicApplications.length,
    helloWork: helloWorkApplications.length,
    byStatusFamily: statusCounts,
    possibleDuplicateGroups: possibleDuplicates.length,
  },
  possibleDuplicateReview: possibleDuplicates,
  applications: allApplications,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");

console.log(
  JSON.stringify(
    {
      outputPath,
      total: output.statistics.total,
      historic: output.statistics.historic,
      helloWork: output.statistics.helloWork,
      possibleDuplicateGroups: output.statistics.possibleDuplicateGroups,
      byStatusFamily: output.statistics.byStatusFamily,
    },
    null,
    2,
  ),
);
