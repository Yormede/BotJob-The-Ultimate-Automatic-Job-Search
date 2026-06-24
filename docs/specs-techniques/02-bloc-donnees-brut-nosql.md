---
title: BotJob - Bloc de donnees brut NoSQL
date: 2026-06-13
tags:
  - BotJob
  - data
  - NoSQL
  - BDD
status: draft
---

# BotJob - Bloc de Donnees Brut NoSQL

Ce document applique la methode METH-001: capturer les donnees progressivement avant de concevoir la base finale.

Ce n'est pas encore un schema definitif. C'est un gros objet de travail pour ne rien oublier.

> [!warning]
> Pour la vraie architecture, les donnees d'authentification et de securite devront etre separees des donnees metier. Ici elles sont visibles dans un meme bloc uniquement pour la phase de conception.

## Objet Brut

```ts
const botJobWorkspaceDraft = {
  user: {
    id: "user_...",
    createdAt: "2026-06-13T00:00:00.000Z",
    updatedAt: "2026-06-13T00:00:00.000Z",
    status: "active", // active | disabled | pending_email_verification | deleted_requested

    identity: {
      username: "",
      email: "",
      emailVerified: false,
      emailVerification: {
        codeHash: "",
        sentAt: "",
        expiresAt: "",
        attempts: 0,
        lastSentAt: ""
      },
      firstName: "",
      lastName: "",
      phone: {
        countryCode: "",
        number: "",
        verified: false,
        whatsappVerificationPlannedForV2: true
      },
      avatar: {
        id: "",
        imagePath: "",
        thumbPath: "",
        assignedAt: ""
      }
    },

    auth: {
      passwordHash: "",
      oauthAccounts: [
        {
          provider: "google", // google | apple
          providerUserId: "",
          providerEmail: "",
          scopesGranted: ["openid", "email", "profile"],
          linkedAt: "",
          lastLoginAt: "",
          rawProfileSnapshot: {
            email: "",
            emailVerified: false,
            name: "",
            firstName: "",
            lastName: "",
            pictureUrl: ""
          }
        }
      ],
      resetPassword: {
        codeHash: "",
        sentAt: "",
        expiresAt: "",
        attempts: 0
      },
      sessions: [
        {
          id: "session_...",
          sessionTokenHash: "",
          createdAt: "",
          lastSeenAt: "",
          expiresAt: "",
          userAgent: "",
          ipHash: "",
          revokedAt: ""
        }
      ]
    },

    preferences: {
      theme: "dark", // dark | light | system
      dashboardStats: {
        primaryMetric: {
          key: "applications_count",
          period: "month" // week | month | quarter | lifetime
        },
        secondaryMetric: {
          key: "applications_count",
          period: "week"
        }
      },
      applicationsTableView: {
        activeSavedViewId: "",
        savedViews: [
          {
            id: "view_...",
            name: "Vue principale",
            savedAt: "",
            visibleColumns: [
              "company",
              "jobTitle",
              "jobAxis",
              "status",
              "appliedAt",
              "location",
              "contractType",
              "internalContact",
              "remark",
              "followUp1At",
              "followUp2At",
              "interview1At",
              "lastAction",
              "nextAction"
            ],
            columnOrder: [],
            sort: {
              field: "appliedAt",
              direction: "desc"
            },
            density: "comfortable" // compact | comfortable | spacious
          }
        ]
      }
    }
  },

  studio: {
    aiMasterProfile: {
      updatedAt: "",
      customInstructions: {
        id: "instructions_...",
        fileName: "custom-instructions.md",
        format: "markdown",
        content: "",
        updatedAt: "",
        updatedBy: "user" // user | assistant
      },
      sections: {
        personalLifeUseful: "",
        personalProjects: "",
        professionalProjects: "",
        professionalEducation: "",
        personalEducation: "",
        professionalSkills: "",
        personalSkills: "",
        experiences: ""
      },
      lifeTrace: [
        {
          id: "life_...",
          dateLabel: "",
          title: "",
          description: "",
          source: "manual" // manual | assistant | import
        }
      ],
      assistantLocalChat: {
        v1Storage: "messages_can_be_stored_without_rollback",
        messages: [
          {
            id: "msg_...",
            role: "user", // user | assistant | system
            content: "",
            createdAt: ""
          }
        ]
      },
      externalAiImport: {
        promptTemplate: "",
        lastCopiedAt: "",
        adviceText: "Ne collez pas directement la reponse dans le profil maitre IA. Collez-la dans le chat assistant BotJob pour qu'il trie et mette a jour les bonnes sections."
      }
    },

    jobAxes: [
      {
        id: "axis_...",
        title: "", // ex: Developpeur IA
        description: "",
        contractTypes: ["alternance"], // cdi | cdd | alternance | interim | freelance | stage | part_time | other
        locations: [
          {
            label: "",
            remoteMode: "hybrid" // remote | hybrid | onsite | unspecified
          }
        ],
        priority: 1,
        active: true,
        createdAt: "",
        updatedAt: ""
      }
    ],

    templates: {
      defaultCvTemplateId: "",
      defaultLetterTemplateId: "",
      cvTemplates: [
        {
          id: "tpl_cv_...",
          name: "",
          description: "",
          type: "cv",
          atsOneColumn: true,
          sourceFiles: [
            {
              id: "file_...",
              originalName: "",
              mimeType: "", // text/html | text/css | application/pdf | image/png | image/jpeg | image/webp
              filePath: "",
              uploadedAt: ""
            }
          ],
          sourceFormat: "html_css", // html_css | pdf | image | mixed
          sourceCode: {
            html: "",
            css: ""
          },
          previewImagePath: "",
          createdAt: "",
          updatedAt: "",
          deletedAt: ""
        }
      ],
      letterTemplates: [
        {
          id: "tpl_letter_...",
          name: "",
          description: "",
          type: "letter",
          sourceFiles: [
            {
              id: "file_...",
              originalName: "",
              mimeType: "",
              filePath: "",
              uploadedAt: ""
            }
          ],
          sourceFormat: "html_css",
          sourceCode: {
            html: "",
            css: ""
          },
          previewImagePath: "",
          createdAt: "",
          updatedAt: "",
          deletedAt: ""
        }
      ],
      libraryV2: {
        planned: true,
        notes: "Bibliotheque de templates prevue en V2."
      }
    },

    scraperBotJob: {
      planned: true,
      enabled: false,
      landingInternalText: "Bientot: laissez BotJob chercher des offres, postuler et mettre a jour votre tableau de candidatures.",
      futureSettings: {
        jobAxesToUse: [],
        maxApplicationsPerDay: null,
        requiresManualApproval: true
      }
    }
  },

  dashboard: {
    assistant: {
      aiArchitecture: {
        providerLayer: {
          provider: "opencode-zen-free-tier",
          compatibleProvidersV2: ["openrouter", "openai", "anthropic", "qwen"],
          model: "",
          temperature: 0.3,
          baseUrl: "",
          thinkingMode: false,
          maxOutputTokens: null,
          timeoutMs: null,
          retryCount: 0
        },
        capabilitiesLayer: {
          chat: true,
          structuredOutput: "to_test", // to_test | json_schema | tool_calls | plain_text
          fileInput: "to_test",
          visionInput: "to_test"
        },
        businessFunctionsLayer: {
          assistantChat: true,
          createCvLetterMessage: true,
          createOrUpdateTemplate: true
        }
      },
      permissions: {
        canReadBusinessData: true,
        canWriteBusinessData: true,
        canUpdateApplications: true,
        canUpdateAiMasterProfile: true,
        canUpdateJobAxes: true,
        canCreateApplicationDraft: true,
        cannotModifyEmail: true,
        cannotModifyPassword: true,
        cannotModifyPhone: true,
        cannotModifySecurity: true,
        cannotModifyPayment: true,
        cannotDeleteOrDisableAccount: true
      },
      messages: [
        {
          id: "dash_msg_...",
          role: "user",
          content: "",
          createdAt: "",
          toolCalls: [],
          resultSummary: ""
        }
      ]
    }
  },

  applications: [
    {
      id: "app_...",
      createdAt: "",
      updatedAt: "",

      company: {
        name: "",
        websiteUrl: "",
        internalContact: {
          name: "",
          role: "",
          email: "",
          phone: "",
          linkedinUrl: "",
          notes: ""
        }
      },

      job: {
        title: "",
        axisId: "",
        contractType: "",
        location: "",
        remoteMode: "",
        offerUrl: "",
        offerPublishedAt: "",
        offerCapturedAt: "",
        fullOfferText: "",
        offerSummary: "",
        sourcePlatform: "",
        tags: []
      },

      application: {
        status: "draft", // draft | ready | sent | interview | refused | accepted | archived
        appliedAt: "",
        lastAction: {
          id: "action_...",
          label: "",
          date: "",
          source: "manual" // manual | assistant | system
        },
        nextAction: {
          id: "next_...",
          label: "",
          date: "",
          generatedByAi: true,
          clearedBecauseLastActionChanged: false
        },
        remarks: "",
        searchTags: []
      },

      followUps: [
        {
          id: "follow_1",
          label: "Relance 1",
          plannedAt: "",
          sentAt: "",
          content: "",
          status: "planned", // planned | sent | skipped
          notes: ""
        },
        {
          id: "follow_2",
          label: "Relance 2",
          plannedAt: "",
          sentAt: "",
          content: "",
          status: "planned",
          notes: ""
        }
      ],

      interviews: [
        {
          id: "interview_1",
          label: "Entretien 1",
          scheduledAt: "",
          location: "",
          contactName: "",
          notes: "",
          result: ""
        }
      ],

      generatedArtifacts: {
        cv: {
          id: "artifact_cv_...",
          templateId: "",
          title: "",
          contentText: "",
          htmlPath: "",
          pdfPath: "",
          generatedAt: "",
          atsOneColumn: true,
          version: 1
        },
        motivationLetter: {
          id: "artifact_letter_...",
          templateId: "",
          contentText: "",
          htmlPath: "",
          pdfPath: "",
          generatedAt: "",
          version: 1
        },
        approachMessage: {
          id: "artifact_message_...",
          contentText: "",
          generatedAt: "",
          version: 1
        }
      },

      generationRun: {
        id: "run_...",
        mode: "normal",
        canAiEditStructureOfCv: false,
        requestedOutputs: {
          cv: true,
          motivationLetter: true,
          approachMessage: true
        },
        progressMessages: [
          {
            id: "progress_...",
            status: "done", // pending | running | done | failed
            text: "J'ai termine l'analyse. Je prepare le CV...",
            createdAt: ""
          }
        ],
        startedAt: "",
        finishedAt: "",
        error: ""
      },

      history: {
        events: [
          {
            id: "hist_event_...",
            type: "last_action_changed",
            label: "",
            field: "application.lastAction",
            previousValue: "",
            nextValue: "",
            author: "user", // user | assistant | system
            createdAt: ""
          },
          {
            id: "hist_event_...",
            type: "next_action_cleared",
            label: "",
            field: "application.nextAction",
            previousValue: "",
            nextValue: "",
            author: "system",
            createdAt: ""
          }
        ]
      }
    }
  ],

  exports: {
    applicationsTable: [
      {
        id: "export_...",
        format: "csv", // csv | json | xlsx future
        createdAt: "",
        filePath: "",
        filtersApplied: {},
        includedHiddenFields: true
      }
    ]
  },

  legalAndSystem: {
    deletionRequest: {
      requested: false,
      requestedAt: "",
      functionalInV2: true
    },
    accountDisabled: {
      disabled: false,
      disabledAt: "",
      reason: ""
    },
    billing: {
      plan: "free",
      customerId: "",
      subscriptionId: "",
      status: ""
    }
  }
};
```

## Notes de Conception

### Tags de recherche candidature

Chaque candidature contient `application.searchTags`. Cette liste sert a la recherche rapide.

Elle doit inclure les mots importants venant de:

- entreprise;
- poste;
- axe de recherche;
- statut;
- localisation;
- type contrat;
- contact interne;
- remarques courtes;
- relances;
- entretiens;
- dates utiles.

Elle ne doit pas indexer les contenus longs:

- texte complet de l'offre;
- CV complet;
- lettre complete;
- message complet;
- longs resumes.

### Consignes personnalisees

Chaque utilisateur dispose d'un document logique `custom-instructions.md`.

Le contenu est stocke dans `studio.aiMasterProfile.customInstructions.content`, puis injecte dans le contexte des fonctions IA concernees.

Exemples:

- ne jamais inventer une competence;
- toujours rester prudent sur Python;
- mettre en avant AutoTrust pour les postes produit;
- conserver un ton direct;
- ne pas modifier la structure du CV sans autorisation.

Le document peut etre modifie par l'utilisateur et par l'assistant lorsque l'utilisateur le demande explicitement.

Dans le SaaS, il n'est pas necessaire de creer un vrai fichier physique par utilisateur. La BDD reste la source de verite; l'application peut proposer un import/export Markdown.

### Derniere action et prochaine action

Regle:

- l'IA peut proposer/remplir `nextAction`;
- si l'utilisateur modifie `lastAction`, alors `nextAction` est videe;
- l'ancienne `nextAction` est conservee dans `history.nextActions` avec l'etat `cleared`;
- le front peut afficher cette ancienne prochaine action en gris dans l'historique.

### Tableau de suivi

Le tableau est dense mais aere. Il doit permettre:

- recherche;
- filtrage;
- colonnes visibles configurables;
- sauvegarde de la vue;
- export complet;
- copie d'une ligne complete avec champs caches inclus.

### Auth et securite

Dans un schema final, `auth.passwordHash`, `sessions`, `resetPassword` et les informations sensibles ne doivent pas etre melanges librement avec les donnees metier.

### Champs volontairement retires

Les champs suivants ont ete retires du bloc brut:

- `avatar.selectedByUser`;
- `avatar.randomlyAssigned`;
- `studio.aiMasterProfile.sourceSummary`;
- `studio.aiMasterProfile.sections.writingPreferences`;
- `studio.aiMasterProfile.sections.neverUse`;
- `studio.jobAxes[].keywords`;
- `studio.jobAxes[].excludedKeywords`;
- `dashboard.quickCreate`;
- `dashboard.recentApplicationsWidget`;
- `dashboard.assistant.createCvOverlay`;
- `application.copyExport`.

Raison: ces donnees etaient soit inutiles en V1, soit du pur etat front, soit des preferences a traiter plus tard si un besoin concret apparait. Les mots cles d'axes seront ajoutes seulement si les tests montrent que le titre, le contrat, la localisation, les consignes personnalisees et l'analyse IA ne suffisent pas.
