import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const INTERVIEW_SEED_QUESTIONS = [
  {
    "questionText": "Tell me about yourself.",
    "questionTextAr": "حدّثني عن نفسك.",
    "answerTemplate": "I am currently a [role] with [X] years of experience in [field]. Previously I [past highlight]. I'm excited about this role because [connection].",
    "answerTemplateAr": "أعمل حالياً كـ[دور] ولدي [X] سنوات خبرة في [مجال]. سابقاً [إنجاز]. أشعر بالحماس لهذا الدور لأن [صلة].",
    "roleCategory": "general",
    "seniorityLevel": "entry",
    "questionType": "behavioral",
    "interviewRound": "phone_screen",
    "difficulty": "easy",
    "tags": [
      "intro",
      "warmup"
    ],
    "timeLimitSeconds": 90,
    "followUpQuestions": [
      {
        "text": "Can you give a more specific example related to: Tell me about yourself.?",
        "textAr": "هل يمكنك إعطاء مثال أكثر تحديداً بخصوص: حدّثني عن نفسك.؟"
      }
    ],
    "evaluationRubric": {
      "criteria": [
        {
          "name": "Content relevance",
          "weight": 3
        },
        {
          "name": "Structure / STAR",
          "weight": 3
        },
        {
          "name": "Evidence & metrics",
          "weight": 2
        },
        {
          "name": "Delivery clarity",
          "weight": 2
        }
      ],
      "total": 10
    },
    "coachingTips": [
      "Be specific with one concrete example",
      "Use STAR and finish with a result"
    ]
  },
  {
    "questionText": "What is your greatest strength?",
    "questionTextAr": "ما هي أعظم نقاط قوتك؟",
    "answerTemplate": "My greatest strength is [strength]. For example, at [company] I [action] which led to [result].",
    "answerTemplateAr": "أعظم نقاط قوتي هي [قوة]. مثلاً في [شركة] قمت بـ[إجراء] مما أدى إلى [نتيجة].",
    "roleCategory": "general",
    "seniorityLevel": "entry",
    "questionType": "behavioral",
    "interviewRound": "phone_screen",
    "difficulty": "easy",
    "tags": [
      "strengths"
    ],
    "timeLimitSeconds": 90,
    "followUpQuestions": [
      {
        "text": "Can you give a more specific example related to: What is your greatest strength??",
        "textAr": "هل يمكنك إعطاء مثال أكثر تحديداً بخصوص: ما هي أعظم نقاط قوتك؟؟"
      }
    ],
    "evaluationRubric": {
      "criteria": [
        {
          "name": "Content relevance",
          "weight": 3
        },
        {
          "name": "Structure / STAR",
          "weight": 3
        },
        {
          "name": "Evidence & metrics",
          "weight": 2
        },
        {
          "name": "Delivery clarity",
          "weight": 2
        }
      ],
      "total": 10
    },
    "coachingTips": [
      "Be specific with one concrete example",
      "Use STAR and finish with a result"
    ]
  },
  {
    "questionText": "What is your greatest weakness?",
    "questionTextAr": "ما هي أكبر نقاط ضعفك؟",
    "answerTemplate": "One area I'm improving is [weakness]. I've addressed it by [actions], and recently [progress].",
    "answerTemplateAr": "أحد المجالات التي أطوّرها هو [ضعف]. عالجته عبر [إجراءات]، ومؤخراً [تقدّم].",
    "roleCategory": "general",
    "seniorityLevel": "entry",
    "questionType": "behavioral",
    "interviewRound": "phone_screen",
    "difficulty": "medium",
    "tags": [
      "weakness",
      "growth"
    ],
    "timeLimitSeconds": 180,
    "followUpQuestions": [
      {
        "text": "Can you give a more specific example related to: What is your greatest weakness??",
        "textAr": "هل يمكنك إعطاء مثال أكثر تحديداً بخصوص: ما هي أكبر نقاط ضعفك؟؟"
      },
      {
        "text": "What was the measurable outcome?",
        "textAr": "ما كانت النتيجة القابلة للقياس؟"
      }
    ],
    "evaluationRubric": {
      "criteria": [
        {
          "name": "Content relevance",
          "weight": 3
        },
        {
          "name": "Structure / STAR",
          "weight": 3
        },
        {
          "name": "Evidence & metrics",
          "weight": 2
        },
        {
          "name": "Delivery clarity",
          "weight": 2
        }
      ],
      "total": 10
    },
    "coachingTips": [
      "Be specific with one concrete example",
      "Use STAR and finish with a result"
    ]
  },
  {
    "questionText": "Tell me about a time you faced a conflict at work.",
    "questionTextAr": "أخبرني عن مرة واجهت فيها خلافاً في العمل.",
    "answerTemplate": "Situation: [context]. Task: [goal]. Action: [steps to resolve]. Result: [outcome + learning].",
    "answerTemplateAr": "الموقف: [سياق]. المهمة: [هدف]. الإجراء: [خطوات الحل]. النتيجة: [أثر + تعلّم].",
    "roleCategory": "general",
    "seniorityLevel": "mid",
    "questionType": "behavioral",
    "interviewRound": "behavioral",
    "difficulty": "medium",
    "tags": [
      "conflict",
      "star"
    ],
    "timeLimitSeconds": 180,
    "followUpQuestions": [
      {
        "text": "Can you give a more specific example related to: Tell me about a time you faced a conflict at work.?",
        "textAr": "هل يمكنك إعطاء مثال أكثر تحديداً بخصوص: أخبرني عن مرة واجهت فيها خلافاً في العمل.؟"
      },
      {
        "text": "What was the measurable outcome?",
        "textAr": "ما كانت النتيجة القابلة للقياس؟"
      }
    ],
    "evaluationRubric": {
      "criteria": [
        {
          "name": "Content relevance",
          "weight": 3
        },
        {
          "name": "Structure / STAR",
          "weight": 3
        },
        {
          "name": "Evidence & metrics",
          "weight": 2
        },
        {
          "name": "Delivery clarity",
          "weight": 2
        }
      ],
      "total": 10
    },
    "coachingTips": [
      "Be specific with one concrete example",
      "Use STAR and finish with a result"
    ]
  },
  {
    "questionText": "Describe a time you failed.",
    "questionTextAr": "صف موقفاً فشلت فيه.",
    "answerTemplate": "I once [failure]. I took ownership by [actions], learned [lesson], and later applied it when [success].",
    "answerTemplateAr": "مرة [فشل]. تحمّلت المسؤولية عبر [إجراءات]، وتعلّمت [درس]، ثم طبّقته عندما [نجاح].",
    "roleCategory": "general",
    "seniorityLevel": "mid",
    "questionType": "behavioral",
    "interviewRound": "behavioral",
    "difficulty": "medium",
    "tags": [
      "failure",
      "learning"
    ],
    "timeLimitSeconds": 180,
    "followUpQuestions": [
      {
        "text": "Can you give a more specific example related to: Describe a time you failed.?",
        "textAr": "هل يمكنك إعطاء مثال أكثر تحديداً بخصوص: صف موقفاً فشلت فيه.؟"
      },
      {
        "text": "What was the measurable outcome?",
        "textAr": "ما كانت النتيجة القابلة للقياس؟"
      }
    ],
    "evaluationRubric": {
      "criteria": [
        {
          "name": "Content relevance",
          "weight": 3
        },
        {
          "name": "Structure / STAR",
          "weight": 3
        },
        {
          "name": "Evidence & metrics",
          "weight": 2
        },
        {
          "name": "Delivery clarity",
          "weight": 2
        }
      ],
      "total": 10
    },
    "coachingTips": [
      "Be specific with one concrete example",
      "Use STAR and finish with a result"
    ]
  },
  {
    "questionText": "Why do you want to leave your current job?",
    "questionTextAr": "لماذا تريد مغادرة وظيفتك الحالية؟",
    "answerTemplate": "I've valued my time at [company], especially [win]. I'm looking for [growth/scope] that this role offers.",
    "answerTemplateAr": "قدّرت وقتي في [شركة] خاصة [إنجاز]. أبحث عن [نمو/نطاق] يوفّره هذا الدور.",
    "roleCategory": "general",
    "seniorityLevel": "mid",
    "questionType": "behavioral",
    "interviewRound": "phone_screen",
    "difficulty": "medium",
    "tags": [
      "motivation"
    ],
    "timeLimitSeconds": 180,
    "followUpQuestions": [
      {
        "text": "Can you give a more specific example related to: Why do you want to leave your current job??",
        "textAr": "هل يمكنك إعطاء مثال أكثر تحديداً بخصوص: لماذا تريد مغادرة وظيفتك الحالية؟؟"
      },
      {
        "text": "What was the measurable outcome?",
        "textAr": "ما كانت النتيجة القابلة للقياس؟"
      }
    ],
    "evaluationRubric": {
      "criteria": [
        {
          "name": "Content relevance",
          "weight": 3
        },
        {
          "name": "Structure / STAR",
          "weight": 3
        },
        {
          "name": "Evidence & metrics",
          "weight": 2
        },
        {
          "name": "Delivery clarity",
          "weight": 2
        }
      ],
      "total": 10
    },
    "coachingTips": [
      "Be specific with one concrete example",
      "Use STAR and finish with a result"
    ]
  },
  {
    "questionText": "Where do you see yourself in 5 years?",
    "questionTextAr": "أين ترى نفسك خلال ٥ سنوات؟",
    "answerTemplate": "In five years I aim to be [role/impact], deepening skills in [areas] while mentoring others.",
    "answerTemplateAr": "خلال خمس سنوات أطمح أن أكون [دور/أثر]، مع تعميق مهاراتي في [مجالات] وإرشاد الآخرين.",
    "roleCategory": "general",
    "seniorityLevel": "entry",
    "questionType": "behavioral",
    "interviewRound": "behavioral",
    "difficulty": "medium",
    "tags": [
      "career"
    ],
    "timeLimitSeconds": 180,
    "followUpQuestions": [
      {
        "text": "Can you give a more specific example related to: Where do you see yourself in 5 years??",
        "textAr": "هل يمكنك إعطاء مثال أكثر تحديداً بخصوص: أين ترى نفسك خلال ٥ سنوات؟؟"
      },
      {
        "text": "What was the measurable outcome?",
        "textAr": "ما كانت النتيجة القابلة للقياس؟"
      }
    ],
    "evaluationRubric": {
      "criteria": [
        {
          "name": "Content relevance",
          "weight": 3
        },
        {
          "name": "Structure / STAR",
          "weight": 3
        },
        {
          "name": "Evidence & metrics",
          "weight": 2
        },
        {
          "name": "Delivery clarity",
          "weight": 2
        }
      ],
      "total": 10
    },
    "coachingTips": [
      "Be specific with one concrete example",
      "Use STAR and finish with a result"
    ]
  },
  {
    "questionText": "Why should we hire you?",
    "questionTextAr": "لماذا يجب أن نوظّفك؟",
    "answerTemplate": "I bring [skill 1], [skill 2], and proven impact like [metric]. I'm ready to contribute to [company goal] from day one.",
    "answerTemplateAr": "أقدّم [مهارة١] و[مهارة٢] وأثراً مثبتاً مثل [مقياس]. أنا جاهز للمساهمة في [هدف الشركة] من اليوم الأول.",
    "roleCategory": "general",
    "seniorityLevel": "mid",
    "questionType": "behavioral",
    "interviewRound": "final",
    "difficulty": "medium",
    "tags": [
      "value"
    ],
    "timeLimitSeconds": 180,
    "followUpQuestions": [
      {
        "text": "Can you give a more specific example related to: Why should we hire you??",
        "textAr": "هل يمكنك إعطاء مثال أكثر تحديداً بخصوص: لماذا يجب أن نوظّفك؟؟"
      },
      {
        "text": "What was the measurable outcome?",
        "textAr": "ما كانت النتيجة القابلة للقياس؟"
      }
    ],
    "evaluationRubric": {
      "criteria": [
        {
          "name": "Content relevance",
          "weight": 3
        },
        {
          "name": "Structure / STAR",
          "weight": 3
        },
        {
          "name": "Evidence & metrics",
          "weight": 2
        },
        {
          "name": "Delivery clarity",
          "weight": 2
        }
      ],
      "total": 10
    },
    "coachingTips": [
      "Be specific with one concrete example",
      "Use STAR and finish with a result"
    ]
  },
  {
    "questionText": "What is the difference between REST and GraphQL?",
    "questionTextAr": "ما الفرق بين REST و GraphQL؟",
    "answerTemplate": "REST exposes multiple resource endpoints; GraphQL uses a single endpoint with a typed query language. REST is cache-friendly; GraphQL reduces over-fetching.",
    "answerTemplateAr": "REST يوفّر نقاط نهاية متعددة للموارد؛ GraphQL يستخدم نقطة واحدة بلغة استعلام مُنمذجة. REST مناسب للتخزين المؤقت؛ GraphQL يقلّل الجلب الزائد.",
    "roleCategory": "software_engineer",
    "seniorityLevel": "entry",
    "questionType": "technical",
    "interviewRound": "technical",
    "difficulty": "easy",
    "tags": [
      "api"
    ],
    "timeLimitSeconds": 90,
    "followUpQuestions": [
      {
        "text": "Can you give a more specific example related to: What is the difference between REST and GraphQL??",
        "textAr": "هل يمكنك إعطاء مثال أكثر تحديداً بخصوص: ما الفرق بين REST و GraphQL؟؟"
      }
    ],
    "evaluationRubric": {
      "criteria": [
        {
          "name": "Content relevance",
          "weight": 3
        },
        {
          "name": "Structure / STAR",
          "weight": 3
        },
        {
          "name": "Evidence & metrics",
          "weight": 2
        },
        {
          "name": "Delivery clarity",
          "weight": 2
        }
      ],
      "total": 10
    },
    "coachingTips": [
      "Be specific with one concrete example",
      "Explain trade-offs clearly"
    ]
  },
  {
    "questionText": "Explain Big O notation.",
    "questionTextAr": "اشرح مفهوم Big O.",
    "answerTemplate": "Big O describes how runtime/space grows with input size. Example: binary search is O(log n); nested loops often O(n²).",
    "answerTemplateAr": "Big O يصف نمو وقت/مساحة التنفيذ مع حجم المدخلات. مثال: البحث الثنائي O(log n)؛ الحلقات المتداخلة غالباً O(n²).",
    "roleCategory": "software_engineer",
    "seniorityLevel": "entry",
    "questionType": "technical",
    "interviewRound": "technical",
    "difficulty": "easy",
    "tags": [
      "algorithms"
    ],
    "timeLimitSeconds": 90,
    "followUpQuestions": [
      {
        "text": "Can you give a more specific example related to: Explain Big O notation.?",
        "textAr": "هل يمكنك إعطاء مثال أكثر تحديداً بخصوص: اشرح مفهوم Big O.؟"
      }
    ],
    "evaluationRubric": {
      "criteria": [
        {
          "name": "Content relevance",
          "weight": 3
        },
        {
          "name": "Structure / STAR",
          "weight": 3
        },
        {
          "name": "Evidence & metrics",
          "weight": 2
        },
        {
          "name": "Delivery clarity",
          "weight": 2
        }
      ],
      "total": 10
    },
    "coachingTips": [
      "Be specific with one concrete example",
      "Explain trade-offs clearly"
    ]
  },
  {
    "questionText": "How do you handle database migrations in production?",
    "questionTextAr": "كيف تتعامل مع ترحيل قواعد البيانات في بيئة الإنتاج؟",
    "answerTemplate": "I use expand/contract migrations, backfill safely, feature flags, and monitor before dropping old columns.",
    "answerTemplateAr": "أستخدم ترحيل التوسيع/الانكماش، وأملأ البيانات بأمان، وأستخدم أعلام الميزات، وأراقب قبل حذف الأعمدة القديمة.",
    "roleCategory": "software_engineer",
    "seniorityLevel": "mid",
    "questionType": "technical",
    "interviewRound": "technical",
    "difficulty": "medium",
    "tags": [
      "databases",
      "ops"
    ],
    "timeLimitSeconds": 180,
    "followUpQuestions": [
      {
        "text": "Can you give a more specific example related to: How do you handle database migrations in production??",
        "textAr": "هل يمكنك إعطاء مثال أكثر تحديداً بخصوص: كيف تتعامل مع ترحيل قواعد البيانات في بيئة الإنتاج؟؟"
      },
      {
        "text": "What was the measurable outcome?",
        "textAr": "ما كانت النتيجة القابلة للقياس؟"
      }
    ],
    "evaluationRubric": {
      "criteria": [
        {
          "name": "Content relevance",
          "weight": 3
        },
        {
          "name": "Structure / STAR",
          "weight": 3
        },
        {
          "name": "Evidence & metrics",
          "weight": 2
        },
        {
          "name": "Delivery clarity",
          "weight": 2
        }
      ],
      "total": 10
    },
    "coachingTips": [
      "Be specific with one concrete example",
      "Explain trade-offs clearly"
    ]
  },
  {
    "questionText": "Describe your approach to code reviews.",
    "questionTextAr": "صف أسلوبك في مراجعة الشيفرة.",
    "answerTemplate": "I focus on correctness, readability, tests, and risk. I give specific, kind feedback and suggest alternatives.",
    "answerTemplateAr": "أركّز على الصحة وسهولة القراءة والاختبارات والمخاطر. أقدّم ملاحظات محددة ولطيفة وأقترح بدائل.",
    "roleCategory": "software_engineer",
    "seniorityLevel": "mid",
    "questionType": "technical",
    "interviewRound": "technical",
    "difficulty": "medium",
    "tags": [
      "collaboration"
    ],
    "timeLimitSeconds": 180,
    "followUpQuestions": [
      {
        "text": "Can you give a more specific example related to: Describe your approach to code reviews.?",
        "textAr": "هل يمكنك إعطاء مثال أكثر تحديداً بخصوص: صف أسلوبك في مراجعة الشيفرة.؟"
      },
      {
        "text": "What was the measurable outcome?",
        "textAr": "ما كانت النتيجة القابلة للقياس؟"
      }
    ],
    "evaluationRubric": {
      "criteria": [
        {
          "name": "Content relevance",
          "weight": 3
        },
        {
          "name": "Structure / STAR",
          "weight": 3
        },
        {
          "name": "Evidence & metrics",
          "weight": 2
        },
        {
          "name": "Delivery clarity",
          "weight": 2
        }
      ],
      "total": 10
    },
    "coachingTips": [
      "Be specific with one concrete example",
      "Explain trade-offs clearly"
    ]
  },
  {
    "questionText": "Design a URL shortening service like bit.ly.",
    "questionTextAr": "صمّم خدمة اختصار روابط مثل bit.ly.",
    "answerTemplate": "API for create/redirect, base62 IDs, key generation service, cache hot links, analytics pipeline, and high availability datastore.",
    "answerTemplateAr": "واجهة لإنشاء/إعادة التوجيه، معرّفات base62، خدمة توليد مفاتيح، تخزين مؤقت للروابط الشائعة، خط تحليلات، وتخزين عالي التوافر.",
    "roleCategory": "software_engineer",
    "seniorityLevel": "senior",
    "questionType": "technical",
    "interviewRound": "technical",
    "difficulty": "hard",
    "tags": [
      "system-design"
    ],
    "timeLimitSeconds": 300,
    "followUpQuestions": [
      {
        "text": "Can you give a more specific example related to: Design a URL shortening service like bit.ly.?",
        "textAr": "هل يمكنك إعطاء مثال أكثر تحديداً بخصوص: صمّم خدمة اختصار روابط مثل bit.ly.؟"
      },
      {
        "text": "What was the measurable outcome?",
        "textAr": "ما كانت النتيجة القابلة للقياس؟"
      }
    ],
    "evaluationRubric": {
      "criteria": [
        {
          "name": "Content relevance",
          "weight": 3
        },
        {
          "name": "Structure / STAR",
          "weight": 3
        },
        {
          "name": "Evidence & metrics",
          "weight": 2
        },
        {
          "name": "Delivery clarity",
          "weight": 2
        }
      ],
      "total": 10
    },
    "coachingTips": [
      "Be specific with one concrete example",
      "Explain trade-offs clearly"
    ]
  },
  {
    "questionText": "How do you balance technical debt with feature delivery?",
    "questionTextAr": "كيف توازن بين الدين التقني وتسليم الميزات؟",
    "answerTemplate": "I quantify debt risk, reserve capacity (e.g. 20%), align with product outcomes, and ship incremental refactors.",
    "answerTemplateAr": "أقيس مخاطر الدين، وأحجز طاقة (مثلاً ٢٠٪)، وأواءم مع نتائج المنتج، وأسلّم إعادة هيكلة تدريجية.",
    "roleCategory": "software_engineer",
    "seniorityLevel": "senior",
    "questionType": "technical",
    "interviewRound": "technical",
    "difficulty": "hard",
    "tags": [
      "leadership"
    ],
    "timeLimitSeconds": 300,
    "followUpQuestions": [
      {
        "text": "Can you give a more specific example related to: How do you balance technical debt with feature delivery??",
        "textAr": "هل يمكنك إعطاء مثال أكثر تحديداً بخصوص: كيف توازن بين الدين التقني وتسليم الميزات؟؟"
      },
      {
        "text": "What was the measurable outcome?",
        "textAr": "ما كانت النتيجة القابلة للقياس؟"
      }
    ],
    "evaluationRubric": {
      "criteria": [
        {
          "name": "Content relevance",
          "weight": 3
        },
        {
          "name": "Structure / STAR",
          "weight": 3
        },
        {
          "name": "Evidence & metrics",
          "weight": 2
        },
        {
          "name": "Delivery clarity",
          "weight": 2
        }
      ],
      "total": 10
    },
    "coachingTips": [
      "Be specific with one concrete example",
      "Explain trade-offs clearly"
    ]
  },
  {
    "questionText": "What is the difference between INNER JOIN and LEFT JOIN?",
    "questionTextAr": "ما الفرق بين INNER JOIN و LEFT JOIN؟",
    "answerTemplate": "INNER JOIN returns matching rows only. LEFT JOIN keeps all left-table rows and nulls unmatched right columns.",
    "answerTemplateAr": "INNER JOIN يُرجع الصفوف المتطابقة فقط. LEFT JOIN يحتفظ بكل صفوف الجدول الأيسر ويضع قيماً فارغة لغير المتطابق.",
    "roleCategory": "data_analyst",
    "seniorityLevel": "entry",
    "questionType": "technical",
    "interviewRound": "technical",
    "difficulty": "easy",
    "tags": [
      "sql"
    ],
    "timeLimitSeconds": 90,
    "followUpQuestions": [
      {
        "text": "Can you give a more specific example related to: What is the difference between INNER JOIN and LEFT JOIN??",
        "textAr": "هل يمكنك إعطاء مثال أكثر تحديداً بخصوص: ما الفرق بين INNER JOIN و LEFT JOIN؟؟"
      }
    ],
    "evaluationRubric": {
      "criteria": [
        {
          "name": "Content relevance",
          "weight": 3
        },
        {
          "name": "Structure / STAR",
          "weight": 3
        },
        {
          "name": "Evidence & metrics",
          "weight": 2
        },
        {
          "name": "Delivery clarity",
          "weight": 2
        }
      ],
      "total": 10
    },
    "coachingTips": [
      "Be specific with one concrete example",
      "Explain trade-offs clearly"
    ]
  },
  {
    "questionText": "How do you handle missing data?",
    "questionTextAr": "كيف تتعامل مع البيانات المفقودة؟",
    "answerTemplate": "I diagnose missingness patterns first, then choose drop, impute, or model accordingly, documenting bias risk.",
    "answerTemplateAr": "أشخّص أنماط الفقد أولاً، ثم أختار الحذف أو التعويض أو النمذجة مع توثيق مخاطر الانحياز.",
    "roleCategory": "data_analyst",
    "seniorityLevel": "entry",
    "questionType": "technical",
    "interviewRound": "technical",
    "difficulty": "easy",
    "tags": [
      "data-quality"
    ],
    "timeLimitSeconds": 90,
    "followUpQuestions": [
      {
        "text": "Can you give a more specific example related to: How do you handle missing data??",
        "textAr": "هل يمكنك إعطاء مثال أكثر تحديداً بخصوص: كيف تتعامل مع البيانات المفقودة؟؟"
      }
    ],
    "evaluationRubric": {
      "criteria": [
        {
          "name": "Content relevance",
          "weight": 3
        },
        {
          "name": "Structure / STAR",
          "weight": 3
        },
        {
          "name": "Evidence & metrics",
          "weight": 2
        },
        {
          "name": "Delivery clarity",
          "weight": 2
        }
      ],
      "total": 10
    },
    "coachingTips": [
      "Be specific with one concrete example",
      "Explain trade-offs clearly"
    ]
  },
  {
    "questionText": "How do you ensure your analysis is statistically significant?",
    "questionTextAr": "كيف تضمن أن تحليلك ذو دلالة إحصائية؟",
    "answerTemplate": "I define hypotheses, choose tests, check assumptions, compute confidence intervals, and avoid p-hacking.",
    "answerTemplateAr": "أحدّد الفرضيات، وأختار الاختبارات، وأتحقق من الافتراضات، وأحسب فترات الثقة، وأتجنب التلاعب بالقيم الاحتمالية.",
    "roleCategory": "data_analyst",
    "seniorityLevel": "mid",
    "questionType": "technical",
    "interviewRound": "technical",
    "difficulty": "medium",
    "tags": [
      "stats"
    ],
    "timeLimitSeconds": 180,
    "followUpQuestions": [
      {
        "text": "Can you give a more specific example related to: How do you ensure your analysis is statistically significant?",
        "textAr": "هل يمكنك إعطاء مثال أكثر تحديداً بخصوص: كيف تضمن أن تحليلك ذو دلالة إحصائية؟؟"
      },
      {
        "text": "What was the measurable outcome?",
        "textAr": "ما كانت النتيجة القابلة للقياس؟"
      }
    ],
    "evaluationRubric": {
      "criteria": [
        {
          "name": "Content relevance",
          "weight": 3
        },
        {
          "name": "Structure / STAR",
          "weight": 3
        },
        {
          "name": "Evidence & metrics",
          "weight": 2
        },
        {
          "name": "Delivery clarity",
          "weight": 2
        }
      ],
      "total": 10
    },
    "coachingTips": [
      "Be specific with one concrete example",
      "Explain trade-offs clearly"
    ]
  },
  {
    "questionText": "Walk me through a project where you turned raw data into business action.",
    "questionTextAr": "اسرد مشروعاً حوّلت فيه بيانات خام إلى قرار عمل.",
    "answerTemplate": "I cleaned [dataset], built [model/dashboard], surfaced [insight], and stakeholders acted by [decision] yielding [metric].",
    "answerTemplateAr": "نظّفت [بيانات]، وبنيت [نموذج/لوحة]، واستخرجت [رؤية]، واتخذ أصحاب المصلحة [قراراً] أدّى إلى [مقياس].",
    "roleCategory": "data_analyst",
    "seniorityLevel": "mid",
    "questionType": "behavioral",
    "interviewRound": "behavioral",
    "difficulty": "medium",
    "tags": [
      "impact",
      "star"
    ],
    "timeLimitSeconds": 180,
    "followUpQuestions": [
      {
        "text": "Can you give a more specific example related to: Walk me through a project where you turned raw data into bus?",
        "textAr": "هل يمكنك إعطاء مثال أكثر تحديداً بخصوص: اسرد مشروعاً حوّلت فيه بيانات خام إلى قرار عمل.؟"
      },
      {
        "text": "What was the measurable outcome?",
        "textAr": "ما كانت النتيجة القابلة للقياس؟"
      }
    ],
    "evaluationRubric": {
      "criteria": [
        {
          "name": "Content relevance",
          "weight": 3
        },
        {
          "name": "Structure / STAR",
          "weight": 3
        },
        {
          "name": "Evidence & metrics",
          "weight": 2
        },
        {
          "name": "Delivery clarity",
          "weight": 2
        }
      ],
      "total": 10
    },
    "coachingTips": [
      "Be specific with one concrete example",
      "Use STAR and finish with a result"
    ]
  },
  {
    "questionText": "How do you build a data-driven culture in an organization?",
    "questionTextAr": "كيف تبني ثقافة قائمة على البيانات في مؤسسة؟",
    "answerTemplate": "I define trusted metrics, democratize self-serve tools, train teams, and celebrate decisions backed by evidence.",
    "answerTemplateAr": "أحدّد مقاييس موثوقة، وأُتيح أدوات الخدمة الذاتية، وأدرّب الفرق، وأحتفي بالقرارات المدعومة بالأدلة.",
    "roleCategory": "data_analyst",
    "seniorityLevel": "senior",
    "questionType": "behavioral",
    "interviewRound": "final",
    "difficulty": "hard",
    "tags": [
      "leadership",
      "culture"
    ],
    "timeLimitSeconds": 300,
    "followUpQuestions": [
      {
        "text": "Can you give a more specific example related to: How do you build a data-driven culture in an organization??",
        "textAr": "هل يمكنك إعطاء مثال أكثر تحديداً بخصوص: كيف تبني ثقافة قائمة على البيانات في مؤسسة؟؟"
      },
      {
        "text": "What was the measurable outcome?",
        "textAr": "ما كانت النتيجة القابلة للقياس؟"
      }
    ],
    "evaluationRubric": {
      "criteria": [
        {
          "name": "Content relevance",
          "weight": 3
        },
        {
          "name": "Structure / STAR",
          "weight": 3
        },
        {
          "name": "Evidence & metrics",
          "weight": 2
        },
        {
          "name": "Delivery clarity",
          "weight": 2
        }
      ],
      "total": 10
    },
    "coachingTips": [
      "Be specific with one concrete example",
      "Use STAR and finish with a result"
    ]
  },
  {
    "questionText": "How do you prioritize features?",
    "questionTextAr": "كيف تحدد أولويات الميزات؟",
    "answerTemplate": "I score by impact vs effort, align to strategy/OKRs, validate with users, and communicate trade-offs.",
    "answerTemplateAr": "أقيّم الأثر مقابل الجهد، وأواءم مع الاستراتيجية/OKRs، وأتحقق مع المستخدمين، وأوضح المقايضات.",
    "roleCategory": "product_manager",
    "seniorityLevel": "entry",
    "questionType": "technical",
    "interviewRound": "technical",
    "difficulty": "easy",
    "tags": [
      "prioritization"
    ],
    "timeLimitSeconds": 90,
    "followUpQuestions": [
      {
        "text": "Can you give a more specific example related to: How do you prioritize features??",
        "textAr": "هل يمكنك إعطاء مثال أكثر تحديداً بخصوص: كيف تحدد أولويات الميزات؟؟"
      }
    ],
    "evaluationRubric": {
      "criteria": [
        {
          "name": "Content relevance",
          "weight": 3
        },
        {
          "name": "Structure / STAR",
          "weight": 3
        },
        {
          "name": "Evidence & metrics",
          "weight": 2
        },
        {
          "name": "Delivery clarity",
          "weight": 2
        }
      ],
      "total": 10
    },
    "coachingTips": [
      "Be specific with one concrete example",
      "Explain trade-offs clearly"
    ]
  },
  {
    "questionText": "Your engineering team says a feature will take 3 months. Your CEO wants it in 6 weeks. What do you do?",
    "questionTextAr": "يقول فريق الهندسة إن الميزة تحتاج ٣ أشهر، والمدير التنفيذي يريدها خلال ٦ أسابيع. ماذا تفعل؟",
    "answerTemplate": "I clarify the outcome, cut scope to an MVP, surface risks, propose phased delivery, and align CEO on trade-offs.",
    "answerTemplateAr": "أوضّح النتيجة المطلوبة، وأقلّص النطاق إلى MVP، وأبرز المخاطر، وأقترح تسليماً مرحلياً، وأواءم المدير التنفيذي على المقايضات.",
    "roleCategory": "product_manager",
    "seniorityLevel": "mid",
    "questionType": "situational",
    "interviewRound": "behavioral",
    "difficulty": "hard",
    "tags": [
      "stakeholder",
      "scope"
    ],
    "timeLimitSeconds": 300,
    "followUpQuestions": [
      {
        "text": "Can you give a more specific example related to: Your engineering team says a feature will take 3 months. You?",
        "textAr": "هل يمكنك إعطاء مثال أكثر تحديداً بخصوص: يقول فريق الهندسة إن الميزة تحتاج ٣ أشهر، والمدير التنفيذي ي؟"
      },
      {
        "text": "What was the measurable outcome?",
        "textAr": "ما كانت النتيجة القابلة للقياس؟"
      }
    ],
    "evaluationRubric": {
      "criteria": [
        {
          "name": "Content relevance",
          "weight": 3
        },
        {
          "name": "Structure / STAR",
          "weight": 3
        },
        {
          "name": "Evidence & metrics",
          "weight": 2
        },
        {
          "name": "Delivery clarity",
          "weight": 2
        }
      ],
      "total": 10
    },
    "coachingTips": [
      "Be specific with one concrete example",
      "Explain trade-offs clearly"
    ]
  },
  {
    "questionText": "How do you measure product-market fit?",
    "questionTextAr": "كيف تقيس ملاءمة المنتج للسوق؟",
    "answerTemplate": "I track retention/engagement, qualitative love signals (e.g. Sean Ellis), willingness to pay, and organic growth.",
    "answerTemplateAr": "أتابع الاحتفاظ/التفاعل، وإشارات الحب النوعية (مثل Sean Ellis)، والاستعداد للدفع، والنمو العضوي.",
    "roleCategory": "product_manager",
    "seniorityLevel": "senior",
    "questionType": "technical",
    "interviewRound": "final",
    "difficulty": "hard",
    "tags": [
      "pmf"
    ],
    "timeLimitSeconds": 300,
    "followUpQuestions": [
      {
        "text": "Can you give a more specific example related to: How do you measure product-market fit??",
        "textAr": "هل يمكنك إعطاء مثال أكثر تحديداً بخصوص: كيف تقيس ملاءمة المنتج للسوق؟؟"
      },
      {
        "text": "What was the measurable outcome?",
        "textAr": "ما كانت النتيجة القابلة للقياس؟"
      }
    ],
    "evaluationRubric": {
      "criteria": [
        {
          "name": "Content relevance",
          "weight": 3
        },
        {
          "name": "Structure / STAR",
          "weight": 3
        },
        {
          "name": "Evidence & metrics",
          "weight": 2
        },
        {
          "name": "Delivery clarity",
          "weight": 2
        }
      ],
      "total": 10
    },
    "coachingTips": [
      "Be specific with one concrete example",
      "Explain trade-offs clearly"
    ]
  },
  {
    "questionText": "How do you measure the success of a marketing campaign?",
    "questionTextAr": "كيف تقيس نجاح حملة تسويقية؟",
    "answerTemplate": "I define goals first (awareness/leads/revenue), then track CTR, CPL, conversion, ROAS, and incremental lift.",
    "answerTemplateAr": "أحدّد الأهداف أولاً (وعي/عملاء محتملون/إيراد)، ثم أتابع CTR وCPL والتحويل وROAS والرفع الإضافي.",
    "roleCategory": "marketing_manager",
    "seniorityLevel": "entry",
    "questionType": "technical",
    "interviewRound": "technical",
    "difficulty": "easy",
    "tags": [
      "metrics"
    ],
    "timeLimitSeconds": 90,
    "followUpQuestions": [
      {
        "text": "Can you give a more specific example related to: How do you measure the success of a marketing campaign??",
        "textAr": "هل يمكنك إعطاء مثال أكثر تحديداً بخصوص: كيف تقيس نجاح حملة تسويقية؟؟"
      }
    ],
    "evaluationRubric": {
      "criteria": [
        {
          "name": "Content relevance",
          "weight": 3
        },
        {
          "name": "Structure / STAR",
          "weight": 3
        },
        {
          "name": "Evidence & metrics",
          "weight": 2
        },
        {
          "name": "Delivery clarity",
          "weight": 2
        }
      ],
      "total": 10
    },
    "coachingTips": [
      "Be specific with one concrete example",
      "Explain trade-offs clearly"
    ]
  },
  {
    "questionText": "A campaign underperformed by 40%. Walk me through your diagnosis.",
    "questionTextAr": "حملة بأداء أقل بنسبة ٤٠٪. اسرد تشخيصك.",
    "answerTemplate": "I check tracking integrity, audience fit, creative fatigue, funnel drop-offs, competitive shifts, then A/B fixes.",
    "answerTemplateAr": "أتحقق من سلامة التتبع، وملاءمة الجمهور، وإرهاق الإبداع، وتسرّب القمع، وتغيّر المنافسة، ثم أصلح عبر A/B.",
    "roleCategory": "marketing_manager",
    "seniorityLevel": "mid",
    "questionType": "situational",
    "interviewRound": "behavioral",
    "difficulty": "hard",
    "tags": [
      "diagnosis"
    ],
    "timeLimitSeconds": 300,
    "followUpQuestions": [
      {
        "text": "Can you give a more specific example related to: A campaign underperformed by 40%. Walk me through your diagn?",
        "textAr": "هل يمكنك إعطاء مثال أكثر تحديداً بخصوص: حملة بأداء أقل بنسبة ٤٠٪. اسرد تشخيصك.؟"
      },
      {
        "text": "What was the measurable outcome?",
        "textAr": "ما كانت النتيجة القابلة للقياس؟"
      }
    ],
    "evaluationRubric": {
      "criteria": [
        {
          "name": "Content relevance",
          "weight": 3
        },
        {
          "name": "Structure / STAR",
          "weight": 3
        },
        {
          "name": "Evidence & metrics",
          "weight": 2
        },
        {
          "name": "Delivery clarity",
          "weight": 2
        }
      ],
      "total": 10
    },
    "coachingTips": [
      "Be specific with one concrete example",
      "Explain trade-offs clearly"
    ]
  },
  {
    "questionText": "How do you handle rejection?",
    "questionTextAr": "كيف تتعامل مع الرفض؟",
    "answerTemplate": "I separate emotion from process, ask for feedback, refine messaging, and keep a consistent activity cadence.",
    "answerTemplateAr": "أفصل العاطفة عن العملية، وأطلب ملاحظات، وأحسّن الرسالة، وأحافظ على إيقاع نشاط ثابت.",
    "roleCategory": "sales",
    "seniorityLevel": "entry",
    "questionType": "behavioral",
    "interviewRound": "phone_screen",
    "difficulty": "easy",
    "tags": [
      "resilience"
    ],
    "timeLimitSeconds": 90,
    "followUpQuestions": [
      {
        "text": "Can you give a more specific example related to: How do you handle rejection??",
        "textAr": "هل يمكنك إعطاء مثال أكثر تحديداً بخصوص: كيف تتعامل مع الرفض؟؟"
      }
    ],
    "evaluationRubric": {
      "criteria": [
        {
          "name": "Content relevance",
          "weight": 3
        },
        {
          "name": "Structure / STAR",
          "weight": 3
        },
        {
          "name": "Evidence & metrics",
          "weight": 2
        },
        {
          "name": "Delivery clarity",
          "weight": 2
        }
      ],
      "total": 10
    },
    "coachingTips": [
      "Be specific with one concrete example",
      "Use STAR and finish with a result"
    ]
  },
  {
    "questionText": "A prospect ghosted you after a great demo. What's your follow-up strategy?",
    "questionTextAr": "اختفى عميل محتمل بعد عرض تجريبي ممتاز. ما استراتيجية متابعتك؟",
    "answerTemplate": "Multi-touch sequence: value recap, stakeholder mapping, soft bump with insight, then break-up email with clear CTA.",
    "answerTemplateAr": "سلسلة متعددة: تلخيص القيمة، تحديد أصحاب المصلحة، تذكير لطيف برؤية، ثم رسالة إنهاء بعبارة واضحة للدعوة.",
    "roleCategory": "sales",
    "seniorityLevel": "mid",
    "questionType": "situational",
    "interviewRound": "behavioral",
    "difficulty": "medium",
    "tags": [
      "follow-up"
    ],
    "timeLimitSeconds": 180,
    "followUpQuestions": [
      {
        "text": "Can you give a more specific example related to: A prospect ghosted you after a great demo. What's your follo?",
        "textAr": "هل يمكنك إعطاء مثال أكثر تحديداً بخصوص: اختفى عميل محتمل بعد عرض تجريبي ممتاز. ما استراتيجية متابعتك؟"
      },
      {
        "text": "What was the measurable outcome?",
        "textAr": "ما كانت النتيجة القابلة للقياس؟"
      }
    ],
    "evaluationRubric": {
      "criteria": [
        {
          "name": "Content relevance",
          "weight": 3
        },
        {
          "name": "Structure / STAR",
          "weight": 3
        },
        {
          "name": "Evidence & metrics",
          "weight": 2
        },
        {
          "name": "Delivery clarity",
          "weight": 2
        }
      ],
      "total": 10
    },
    "coachingTips": [
      "Be specific with one concrete example",
      "Explain trade-offs clearly"
    ]
  },
  {
    "questionText": "How do you build and scale a sales team?",
    "questionTextAr": "كيف تبني وتوسّع فريق مبيعات؟",
    "answerTemplate": "Hire for learning agility, define ICP/playbooks, install coaching cadence, instrument funnel metrics, and promote managers from top performers.",
    "answerTemplateAr": "أوظّف لسرعة التعلّم، وأحدّد ICP/كتيبات، وأثبت إيقاع إرشاد، وأقيس القمع، وأرقّي المديرين من أفضل الأداء.",
    "roleCategory": "sales",
    "seniorityLevel": "senior",
    "questionType": "behavioral",
    "interviewRound": "final",
    "difficulty": "hard",
    "tags": [
      "leadership"
    ],
    "timeLimitSeconds": 300,
    "followUpQuestions": [
      {
        "text": "Can you give a more specific example related to: How do you build and scale a sales team??",
        "textAr": "هل يمكنك إعطاء مثال أكثر تحديداً بخصوص: كيف تبني وتوسّع فريق مبيعات؟؟"
      },
      {
        "text": "What was the measurable outcome?",
        "textAr": "ما كانت النتيجة القابلة للقياس؟"
      }
    ],
    "evaluationRubric": {
      "criteria": [
        {
          "name": "Content relevance",
          "weight": 3
        },
        {
          "name": "Structure / STAR",
          "weight": 3
        },
        {
          "name": "Evidence & metrics",
          "weight": 2
        },
        {
          "name": "Delivery clarity",
          "weight": 2
        }
      ],
      "total": 10
    },
    "coachingTips": [
      "Be specific with one concrete example",
      "Use STAR and finish with a result"
    ]
  },
  {
    "questionText": "How do you ensure a positive candidate experience?",
    "questionTextAr": "كيف تضمن تجربة مرشّح إيجابية؟",
    "answerTemplate": "Clear timelines, respectful communication, prepared interviewers, accessible process, and timely feedback.",
    "answerTemplateAr": "جداول زمنية واضحة، تواصل محترم، محاورون مستعدون، عملية ميسّرة، وملاحظات في الوقت المناسب.",
    "roleCategory": "hr",
    "seniorityLevel": "entry",
    "questionType": "behavioral",
    "interviewRound": "phone_screen",
    "difficulty": "easy",
    "tags": [
      "talent"
    ],
    "timeLimitSeconds": 90,
    "followUpQuestions": [
      {
        "text": "Can you give a more specific example related to: How do you ensure a positive candidate experience??",
        "textAr": "هل يمكنك إعطاء مثال أكثر تحديداً بخصوص: كيف تضمن تجربة مرشّح إيجابية؟؟"
      }
    ],
    "evaluationRubric": {
      "criteria": [
        {
          "name": "Content relevance",
          "weight": 3
        },
        {
          "name": "Structure / STAR",
          "weight": 3
        },
        {
          "name": "Evidence & metrics",
          "weight": 2
        },
        {
          "name": "Delivery clarity",
          "weight": 2
        }
      ],
      "total": 10
    },
    "coachingTips": [
      "Be specific with one concrete example",
      "Use STAR and finish with a result"
    ]
  },
  {
    "questionText": "How do you handle a high-performing employee who is toxic to the team?",
    "questionTextAr": "كيف تتعامل مع موظف عالي الأداء لكنه سام للفريق؟",
    "answerTemplate": "Document behaviors, coach with clear expectations, protect psychological safety, and exit if values aren't met despite support.",
    "answerTemplateAr": "أوثّق السلوكيات، وأرشد بتوقعات واضحة، وأحمي الأمان النفسي، وأنهي العلاقة إن لم تُحترم القيم رغم الدعم.",
    "roleCategory": "hr",
    "seniorityLevel": "mid",
    "questionType": "situational",
    "interviewRound": "behavioral",
    "difficulty": "hard",
    "tags": [
      "people"
    ],
    "timeLimitSeconds": 300,
    "followUpQuestions": [
      {
        "text": "Can you give a more specific example related to: How do you handle a high-performing employee who is toxic to?",
        "textAr": "هل يمكنك إعطاء مثال أكثر تحديداً بخصوص: كيف تتعامل مع موظف عالي الأداء لكنه سام للفريق؟؟"
      },
      {
        "text": "What was the measurable outcome?",
        "textAr": "ما كانت النتيجة القابلة للقياس؟"
      }
    ],
    "evaluationRubric": {
      "criteria": [
        {
          "name": "Content relevance",
          "weight": 3
        },
        {
          "name": "Structure / STAR",
          "weight": 3
        },
        {
          "name": "Evidence & metrics",
          "weight": 2
        },
        {
          "name": "Delivery clarity",
          "weight": 2
        }
      ],
      "total": 10
    },
    "coachingTips": [
      "Be specific with one concrete example",
      "Explain trade-offs clearly"
    ]
  },
  {
    "questionText": "How do you design a compensation strategy that attracts and retains top talent?",
    "questionTextAr": "كيف تصمّم استراتيجية تعويضات تجذب وتحتفظ بأفضل المواهب؟",
    "answerTemplate": "Market benchmarking, internal equity, role leveling, pay-for-performance, benefits/total rewards, and transparent bands.",
    "answerTemplateAr": "قياس السوق، وعدالة داخلية، ومستويات أدوار، وأجر مقابل الأداء، ومزايا/إجمالي المكافآت، ونطاقات شفافة.",
    "roleCategory": "hr",
    "seniorityLevel": "senior",
    "questionType": "technical",
    "interviewRound": "final",
    "difficulty": "hard",
    "tags": [
      "comp"
    ],
    "timeLimitSeconds": 300,
    "followUpQuestions": [
      {
        "text": "Can you give a more specific example related to: How do you design a compensation strategy that attracts and ?",
        "textAr": "هل يمكنك إعطاء مثال أكثر تحديداً بخصوص: كيف تصمّم استراتيجية تعويضات تجذب وتحتفظ بأفضل المواهب؟؟"
      },
      {
        "text": "What was the measurable outcome?",
        "textAr": "ما كانت النتيجة القابلة للقياس؟"
      }
    ],
    "evaluationRubric": {
      "criteria": [
        {
          "name": "Content relevance",
          "weight": 3
        },
        {
          "name": "Structure / STAR",
          "weight": 3
        },
        {
          "name": "Evidence & metrics",
          "weight": 2
        },
        {
          "name": "Delivery clarity",
          "weight": 2
        }
      ],
      "total": 10
    },
    "coachingTips": [
      "Be specific with one concrete example",
      "Explain trade-offs clearly"
    ]
  },
  {
    "questionText": "Walk me through the three financial statements and how they connect.",
    "questionTextAr": "اشرح القوائم المالية الثلاث وكيف تتصل.",
    "answerTemplate": "Income statement → net income flows to retained earnings on the balance sheet and starts the cash flow statement; cash ending ties to balance sheet cash.",
    "answerTemplateAr": "قائمة الدخل → صافي الدخل يذهب إلى الأرباح المبقاة في الميزانية ويبدأ قائمة التدفقات؛ النقدية الختامية ترتبط بنقد الميزانية.",
    "roleCategory": "finance",
    "seniorityLevel": "entry",
    "questionType": "technical",
    "interviewRound": "technical",
    "difficulty": "easy",
    "tags": [
      "accounting"
    ],
    "timeLimitSeconds": 90,
    "followUpQuestions": [
      {
        "text": "Can you give a more specific example related to: Walk me through the three financial statements and how they ?",
        "textAr": "هل يمكنك إعطاء مثال أكثر تحديداً بخصوص: اشرح القوائم المالية الثلاث وكيف تتصل.؟"
      }
    ],
    "evaluationRubric": {
      "criteria": [
        {
          "name": "Content relevance",
          "weight": 3
        },
        {
          "name": "Structure / STAR",
          "weight": 3
        },
        {
          "name": "Evidence & metrics",
          "weight": 2
        },
        {
          "name": "Delivery clarity",
          "weight": 2
        }
      ],
      "total": 10
    },
    "coachingTips": [
      "Be specific with one concrete example",
      "Explain trade-offs clearly"
    ]
  },
  {
    "questionText": "How do you build a financial model for a new product launch?",
    "questionTextAr": "كيف تبني نموذجاً مالياً لإطلاق منتج جديد؟",
    "answerTemplate": "Driver-based revenue, cost structure, ramp assumptions, scenario/sensitivity analysis, unit economics, and cash runway.",
    "answerTemplateAr": "إيراد قائم على محركات، وهيكل تكلفة، وافتراضات تصاعد، وتحليل سيناريو/حساسية، واقتصاديات الوحدة، ومدرج نقدي.",
    "roleCategory": "finance",
    "seniorityLevel": "mid",
    "questionType": "technical",
    "interviewRound": "technical",
    "difficulty": "medium",
    "tags": [
      "modeling"
    ],
    "timeLimitSeconds": 180,
    "followUpQuestions": [
      {
        "text": "Can you give a more specific example related to: How do you build a financial model for a new product launch??",
        "textAr": "هل يمكنك إعطاء مثال أكثر تحديداً بخصوص: كيف تبني نموذجاً مالياً لإطلاق منتج جديد؟؟"
      },
      {
        "text": "What was the measurable outcome?",
        "textAr": "ما كانت النتيجة القابلة للقياس؟"
      }
    ],
    "evaluationRubric": {
      "criteria": [
        {
          "name": "Content relevance",
          "weight": 3
        },
        {
          "name": "Structure / STAR",
          "weight": 3
        },
        {
          "name": "Evidence & metrics",
          "weight": 2
        },
        {
          "name": "Delivery clarity",
          "weight": 2
        }
      ],
      "total": 10
    },
    "coachingTips": [
      "Be specific with one concrete example",
      "Explain trade-offs clearly"
    ]
  },
  {
    "questionText": "How do you evaluate an M&A target?",
    "questionTextAr": "كيف تقيّم هدفاً للاندماج والاستحواذ؟",
    "answerTemplate": "Strategic fit, quality of earnings, synergy sizing, valuation (DCF/comps), integration risk, and governance.",
    "answerTemplateAr": "ملاءمة استراتيجية، وجودة الأرباح، وحجم التآزر، والتقييم (DCF/مقارنات)، ومخاطر التكامل، والحوكمة.",
    "roleCategory": "finance",
    "seniorityLevel": "senior",
    "questionType": "technical",
    "interviewRound": "final",
    "difficulty": "hard",
    "tags": [
      "ma"
    ],
    "timeLimitSeconds": 300,
    "followUpQuestions": [
      {
        "text": "Can you give a more specific example related to: How do you evaluate an M&A target??",
        "textAr": "هل يمكنك إعطاء مثال أكثر تحديداً بخصوص: كيف تقيّم هدفاً للاندماج والاستحواذ؟؟"
      },
      {
        "text": "What was the measurable outcome?",
        "textAr": "ما كانت النتيجة القابلة للقياس؟"
      }
    ],
    "evaluationRubric": {
      "criteria": [
        {
          "name": "Content relevance",
          "weight": 3
        },
        {
          "name": "Structure / STAR",
          "weight": 3
        },
        {
          "name": "Evidence & metrics",
          "weight": 2
        },
        {
          "name": "Delivery clarity",
          "weight": 2
        }
      ],
      "total": 10
    },
    "coachingTips": [
      "Be specific with one concrete example",
      "Explain trade-offs clearly"
    ]
  },
  {
    "questionText": "You have two critical deadlines on the same day. How do you prioritize?",
    "questionTextAr": "لديك موعدان حرجان في اليوم نفسه. كيف تحدد الأولوية؟",
    "answerTemplate": "I assess impact/urgency, negotiate scope or sequencing, communicate early, and protect the higher-risk deliverable.",
    "answerTemplateAr": "أقيّم الأثر/الاستعجال، وأتفاوض على النطاق أو الترتيب، وأتواصل مبكراً، وأحمي التسليم الأعلى خطراً.",
    "roleCategory": "general",
    "seniorityLevel": "mid",
    "questionType": "situational",
    "interviewRound": "behavioral",
    "difficulty": "medium",
    "tags": [
      "prioritization"
    ],
    "timeLimitSeconds": 180,
    "followUpQuestions": [
      {
        "text": "Can you give a more specific example related to: You have two critical deadlines on the same day. How do you ?",
        "textAr": "هل يمكنك إعطاء مثال أكثر تحديداً بخصوص: لديك موعدان حرجان في اليوم نفسه. كيف تحدد الأولوية؟؟"
      },
      {
        "text": "What was the measurable outcome?",
        "textAr": "ما كانت النتيجة القابلة للقياس؟"
      }
    ],
    "evaluationRubric": {
      "criteria": [
        {
          "name": "Content relevance",
          "weight": 3
        },
        {
          "name": "Structure / STAR",
          "weight": 3
        },
        {
          "name": "Evidence & metrics",
          "weight": 2
        },
        {
          "name": "Delivery clarity",
          "weight": 2
        }
      ],
      "total": 10
    },
    "coachingTips": [
      "Be specific with one concrete example",
      "Explain trade-offs clearly"
    ]
  },
  {
    "questionText": "Your manager asks you to do something unethical. What do you do?",
    "questionTextAr": "يطلب منك مديرك فعل شيء غير أخلاقي. ماذا تفعل؟",
    "answerTemplate": "I refuse politely, clarify policy/risk, propose ethical alternatives, and escalate to HR/compliance if needed.",
    "answerTemplateAr": "أرفض بلباقة، وأوضّح السياسة/المخاطر، وأقترح بدائل أخلاقية، وأصعّد إلى الموارد البشرية/الامتثال عند الحاجة.",
    "roleCategory": "general",
    "seniorityLevel": "mid",
    "questionType": "situational",
    "interviewRound": "behavioral",
    "difficulty": "hard",
    "tags": [
      "ethics"
    ],
    "timeLimitSeconds": 300,
    "followUpQuestions": [
      {
        "text": "Can you give a more specific example related to: Your manager asks you to do something unethical. What do you?",
        "textAr": "هل يمكنك إعطاء مثال أكثر تحديداً بخصوص: يطلب منك مديرك فعل شيء غير أخلاقي. ماذا تفعل؟؟"
      },
      {
        "text": "What was the measurable outcome?",
        "textAr": "ما كانت النتيجة القابلة للقياس؟"
      }
    ],
    "evaluationRubric": {
      "criteria": [
        {
          "name": "Content relevance",
          "weight": 3
        },
        {
          "name": "Structure / STAR",
          "weight": 3
        },
        {
          "name": "Evidence & metrics",
          "weight": 2
        },
        {
          "name": "Delivery clarity",
          "weight": 2
        }
      ],
      "total": 10
    },
    "coachingTips": [
      "Be specific with one concrete example",
      "Explain trade-offs clearly"
    ]
  },
  {
    "questionText": "A key team member resigns 2 weeks before a major launch. What do you do?",
    "questionTextAr": "يستقيل عضو أساسي قبل أسبوعين من إطلاق كبير. ماذا تفعل؟",
    "answerTemplate": "Stabilize knowledge transfer, re-scope critical path, redistribute ownership, add temporary support, and communicate risks.",
    "answerTemplateAr": "أثبّت نقل المعرفة، وأعيد نطاق المسار الحرج، وأعيد توزيع الملكية، وأضيف دعماً مؤقتاً، وأتواصل بشأن المخاطر.",
    "roleCategory": "general",
    "seniorityLevel": "senior",
    "questionType": "situational",
    "interviewRound": "behavioral",
    "difficulty": "hard",
    "tags": [
      "crisis"
    ],
    "timeLimitSeconds": 300,
    "followUpQuestions": [
      {
        "text": "Can you give a more specific example related to: A key team member resigns 2 weeks before a major launch. Wha?",
        "textAr": "هل يمكنك إعطاء مثال أكثر تحديداً بخصوص: يستقيل عضو أساسي قبل أسبوعين من إطلاق كبير. ماذا تفعل؟؟"
      },
      {
        "text": "What was the measurable outcome?",
        "textAr": "ما كانت النتيجة القابلة للقياس؟"
      }
    ],
    "evaluationRubric": {
      "criteria": [
        {
          "name": "Content relevance",
          "weight": 3
        },
        {
          "name": "Structure / STAR",
          "weight": 3
        },
        {
          "name": "Evidence & metrics",
          "weight": 2
        },
        {
          "name": "Delivery clarity",
          "weight": 2
        }
      ],
      "total": 10
    },
    "coachingTips": [
      "Be specific with one concrete example",
      "Explain trade-offs clearly"
    ]
  },
  {
    "questionText": "What kind of work environment do you thrive in?",
    "questionTextAr": "في أي بيئة عمل تزدهر؟",
    "answerTemplate": "I thrive in [collaborative/ownership-driven] environments with clear goals, feedback, and psychological safety.",
    "answerTemplateAr": "أزدهر في بيئات [تعاونية/قائمة على الملكية] بأهداف واضحة وملاحظات وأمان نفسي.",
    "roleCategory": "general",
    "seniorityLevel": "entry",
    "questionType": "cultural_fit",
    "interviewRound": "phone_screen",
    "difficulty": "easy",
    "tags": [
      "culture"
    ],
    "timeLimitSeconds": 90,
    "followUpQuestions": [
      {
        "text": "Can you give a more specific example related to: What kind of work environment do you thrive in??",
        "textAr": "هل يمكنك إعطاء مثال أكثر تحديداً بخصوص: في أي بيئة عمل تزدهر؟؟"
      }
    ],
    "evaluationRubric": {
      "criteria": [
        {
          "name": "Content relevance",
          "weight": 3
        },
        {
          "name": "Structure / STAR",
          "weight": 3
        },
        {
          "name": "Evidence & metrics",
          "weight": 2
        },
        {
          "name": "Delivery clarity",
          "weight": 2
        }
      ],
      "total": 10
    },
    "coachingTips": [
      "Be specific with one concrete example",
      "Explain trade-offs clearly"
    ]
  },
  {
    "questionText": "What motivates you?",
    "questionTextAr": "ما الذي يحفّزك؟",
    "answerTemplate": "I'm motivated by solving meaningful problems, learning quickly, and seeing measurable impact for users/customers.",
    "answerTemplateAr": "يحفّزني حل مشكلات ذات معنى، والتعلّم السريع، ورؤية أثر قابل للقياس للمستخدمين/العملاء.",
    "roleCategory": "general",
    "seniorityLevel": "entry",
    "questionType": "cultural_fit",
    "interviewRound": "phone_screen",
    "difficulty": "easy",
    "tags": [
      "motivation"
    ],
    "timeLimitSeconds": 90,
    "followUpQuestions": [
      {
        "text": "Can you give a more specific example related to: What motivates you??",
        "textAr": "هل يمكنك إعطاء مثال أكثر تحديداً بخصوص: ما الذي يحفّزك؟؟"
      }
    ],
    "evaluationRubric": {
      "criteria": [
        {
          "name": "Content relevance",
          "weight": 3
        },
        {
          "name": "Structure / STAR",
          "weight": 3
        },
        {
          "name": "Evidence & metrics",
          "weight": 2
        },
        {
          "name": "Delivery clarity",
          "weight": 2
        }
      ],
      "total": 10
    },
    "coachingTips": [
      "Be specific with one concrete example",
      "Explain trade-offs clearly"
    ]
  },
  {
    "questionText": "How do you handle feedback?",
    "questionTextAr": "كيف تتعامل مع الملاحظات؟",
    "answerTemplate": "I listen without defensiveness, clarify expectations, convert feedback into actions, and follow up on progress.",
    "answerTemplateAr": "أستمع دون دفاع، وأوضّح التوقعات، وأحوّل الملاحظات إلى إجراءات، وأتابع التقدّم.",
    "roleCategory": "general",
    "seniorityLevel": "mid",
    "questionType": "cultural_fit",
    "interviewRound": "behavioral",
    "difficulty": "medium",
    "tags": [
      "feedback"
    ],
    "timeLimitSeconds": 180,
    "followUpQuestions": [
      {
        "text": "Can you give a more specific example related to: How do you handle feedback??",
        "textAr": "هل يمكنك إعطاء مثال أكثر تحديداً بخصوص: كيف تتعامل مع الملاحظات؟؟"
      },
      {
        "text": "What was the measurable outcome?",
        "textAr": "ما كانت النتيجة القابلة للقياس؟"
      }
    ],
    "evaluationRubric": {
      "criteria": [
        {
          "name": "Content relevance",
          "weight": 3
        },
        {
          "name": "Structure / STAR",
          "weight": 3
        },
        {
          "name": "Evidence & metrics",
          "weight": 2
        },
        {
          "name": "Delivery clarity",
          "weight": 2
        }
      ],
      "total": 10
    },
    "coachingTips": [
      "Be specific with one concrete example",
      "Explain trade-offs clearly"
    ]
  },
  {
    "questionText": "What are your salary expectations?",
    "questionTextAr": "ما توقعاتك للراتب؟",
    "answerTemplate": "Based on market data for [role/location/level], I'm targeting [range], open to discussing total compensation.",
    "answerTemplateAr": "بناءً على بيانات السوق لـ[دور/موقع/مستوى]، أستهدف [نطاقاً]، ومنفتح لمناقشة إجمالي التعويض.",
    "roleCategory": "general",
    "seniorityLevel": "mid",
    "questionType": "salary",
    "interviewRound": "final",
    "difficulty": "medium",
    "tags": [
      "comp"
    ],
    "timeLimitSeconds": 180,
    "followUpQuestions": [
      {
        "text": "Can you give a more specific example related to: What are your salary expectations??",
        "textAr": "هل يمكنك إعطاء مثال أكثر تحديداً بخصوص: ما توقعاتك للراتب؟؟"
      },
      {
        "text": "What was the measurable outcome?",
        "textAr": "ما كانت النتيجة القابلة للقياس؟"
      }
    ],
    "evaluationRubric": {
      "criteria": [
        {
          "name": "Content relevance",
          "weight": 3
        },
        {
          "name": "Structure / STAR",
          "weight": 3
        },
        {
          "name": "Evidence & metrics",
          "weight": 2
        },
        {
          "name": "Delivery clarity",
          "weight": 2
        }
      ],
      "total": 10
    },
    "coachingTips": [
      "Be specific with one concrete example",
      "Explain trade-offs clearly"
    ]
  },
  {
    "questionText": "Why do you want to work here specifically?",
    "questionTextAr": "لماذا تريد العمل هنا تحديداً؟",
    "answerTemplate": "I'm drawn to [mission/product], impressed by [recent initiative], and believe my [skills] can advance [goal].",
    "answerTemplateAr": "تجذبني [رسالة/منتج]، وأعجبني [مبادرة حديثة]، وأعتقد أن [مهاراتي] يمكن أن تدفع [هدفاً].",
    "roleCategory": "general",
    "seniorityLevel": "mid",
    "questionType": "cultural_fit",
    "interviewRound": "final",
    "difficulty": "medium",
    "tags": [
      "company"
    ],
    "timeLimitSeconds": 180,
    "followUpQuestions": [
      {
        "text": "Can you give a more specific example related to: Why do you want to work here specifically??",
        "textAr": "هل يمكنك إعطاء مثال أكثر تحديداً بخصوص: لماذا تريد العمل هنا تحديداً؟؟"
      },
      {
        "text": "What was the measurable outcome?",
        "textAr": "ما كانت النتيجة القابلة للقياس؟"
      }
    ],
    "evaluationRubric": {
      "criteria": [
        {
          "name": "Content relevance",
          "weight": 3
        },
        {
          "name": "Structure / STAR",
          "weight": 3
        },
        {
          "name": "Evidence & metrics",
          "weight": 2
        },
        {
          "name": "Delivery clarity",
          "weight": 2
        }
      ],
      "total": 10
    },
    "coachingTips": [
      "Be specific with one concrete example",
      "Explain trade-offs clearly"
    ]
  },
  {
    "questionText": "Tell me about a time you had to learn something quickly.",
    "questionTextAr": "أخبرني عن مرة اضطررت فيها لتعلّم شيء بسرعة.",
    "answerTemplate": "I needed to learn [skill] under deadline. I [resources/practice], applied it to [deliverable], and achieved [result].",
    "answerTemplateAr": "احتجت لتعلّم [مهارة] تحت ضغط الوقت. استخدمت [موارد/تمرين]، وطبّقتها على [تسليم]، وحققت [نتيجة].",
    "roleCategory": "general",
    "seniorityLevel": "entry",
    "questionType": "behavioral",
    "interviewRound": "behavioral",
    "difficulty": "medium",
    "tags": [
      "learning"
    ],
    "timeLimitSeconds": 180,
    "followUpQuestions": [
      {
        "text": "Can you give a more specific example related to: Tell me about a time you had to learn something quickly.?",
        "textAr": "هل يمكنك إعطاء مثال أكثر تحديداً بخصوص: أخبرني عن مرة اضطررت فيها لتعلّم شيء بسرعة.؟"
      },
      {
        "text": "What was the measurable outcome?",
        "textAr": "ما كانت النتيجة القابلة للقياس؟"
      }
    ],
    "evaluationRubric": {
      "criteria": [
        {
          "name": "Content relevance",
          "weight": 3
        },
        {
          "name": "Structure / STAR",
          "weight": 3
        },
        {
          "name": "Evidence & metrics",
          "weight": 2
        },
        {
          "name": "Delivery clarity",
          "weight": 2
        }
      ],
      "total": 10
    },
    "coachingTips": [
      "Be specific with one concrete example",
      "Use STAR and finish with a result"
    ]
  },
  {
    "questionText": "Describe a time you went above and beyond.",
    "questionTextAr": "صف موقفاً تجاوزت فيه التوقعات.",
    "answerTemplate": "Beyond my role, I [extra work] to unblock [goal], resulting in [impact] and recognition from [stakeholders].",
    "answerTemplateAr": "خارج دوري، قمت بـ[عمل إضافي] لإزالة عائق [هدف]، مما أدّى إلى [أثر] وتقدير من [أصحاب المصلحة].",
    "roleCategory": "general",
    "seniorityLevel": "mid",
    "questionType": "behavioral",
    "interviewRound": "behavioral",
    "difficulty": "medium",
    "tags": [
      "ownership"
    ],
    "timeLimitSeconds": 180,
    "followUpQuestions": [
      {
        "text": "Can you give a more specific example related to: Describe a time you went above and beyond.?",
        "textAr": "هل يمكنك إعطاء مثال أكثر تحديداً بخصوص: صف موقفاً تجاوزت فيه التوقعات.؟"
      },
      {
        "text": "What was the measurable outcome?",
        "textAr": "ما كانت النتيجة القابلة للقياس؟"
      }
    ],
    "evaluationRubric": {
      "criteria": [
        {
          "name": "Content relevance",
          "weight": 3
        },
        {
          "name": "Structure / STAR",
          "weight": 3
        },
        {
          "name": "Evidence & metrics",
          "weight": 2
        },
        {
          "name": "Delivery clarity",
          "weight": 2
        }
      ],
      "total": 10
    },
    "coachingTips": [
      "Be specific with one concrete example",
      "Use STAR and finish with a result"
    ]
  },
  {
    "questionText": "How do you handle stress and pressure?",
    "questionTextAr": "كيف تتعامل مع التوتر والضغط؟",
    "answerTemplate": "I break work into priorities, communicate early, protect recovery habits, and focus on controllable actions.",
    "answerTemplateAr": "أقسّم العمل إلى أولويات، وأتواصل مبكراً، وأحافظ على عادات التعافي، وأركّز على ما يمكن التحكم به.",
    "roleCategory": "general",
    "seniorityLevel": "entry",
    "questionType": "behavioral",
    "interviewRound": "phone_screen",
    "difficulty": "easy",
    "tags": [
      "stress"
    ],
    "timeLimitSeconds": 90,
    "followUpQuestions": [
      {
        "text": "Can you give a more specific example related to: How do you handle stress and pressure??",
        "textAr": "هل يمكنك إعطاء مثال أكثر تحديداً بخصوص: كيف تتعامل مع التوتر والضغط؟؟"
      }
    ],
    "evaluationRubric": {
      "criteria": [
        {
          "name": "Content relevance",
          "weight": 3
        },
        {
          "name": "Structure / STAR",
          "weight": 3
        },
        {
          "name": "Evidence & metrics",
          "weight": 2
        },
        {
          "name": "Delivery clarity",
          "weight": 2
        }
      ],
      "total": 10
    },
    "coachingTips": [
      "Be specific with one concrete example",
      "Use STAR and finish with a result"
    ]
  },
  {
    "questionText": "What do you know about our company?",
    "questionTextAr": "ماذا تعرف عن شركتنا؟",
    "answerTemplate": "You [product/mission], recently [news], serve [customers], and compete by [differentiation]. I'm excited about [specific].",
    "answerTemplateAr": "أنتم [منتج/رسالة]، ومؤخراً [خبر]، وتخدمون [عملاء]، وتتمايزون بـ[فرق]. يثير حماسي [تفصيل محدد].",
    "roleCategory": "general",
    "seniorityLevel": "entry",
    "questionType": "cultural_fit",
    "interviewRound": "phone_screen",
    "difficulty": "easy",
    "tags": [
      "research"
    ],
    "timeLimitSeconds": 90,
    "followUpQuestions": [
      {
        "text": "Can you give a more specific example related to: What do you know about our company??",
        "textAr": "هل يمكنك إعطاء مثال أكثر تحديداً بخصوص: ماذا تعرف عن شركتنا؟؟"
      }
    ],
    "evaluationRubric": {
      "criteria": [
        {
          "name": "Content relevance",
          "weight": 3
        },
        {
          "name": "Structure / STAR",
          "weight": 3
        },
        {
          "name": "Evidence & metrics",
          "weight": 2
        },
        {
          "name": "Delivery clarity",
          "weight": 2
        }
      ],
      "total": 10
    },
    "coachingTips": [
      "Be specific with one concrete example",
      "Explain trade-offs clearly"
    ]
  },
  {
    "questionText": "Describe your ideal manager.",
    "questionTextAr": "صف مديرك المثالي.",
    "answerTemplate": "Someone who sets clear goals, gives timely feedback, supports growth, and trusts me with ownership.",
    "answerTemplateAr": "شخص يضع أهدافاً واضحة، ويقدّم ملاحظات في الوقت المناسب، ويدعم النمو، ويثق بي بالملكية.",
    "roleCategory": "general",
    "seniorityLevel": "entry",
    "questionType": "cultural_fit",
    "interviewRound": "phone_screen",
    "difficulty": "easy",
    "tags": [
      "management"
    ],
    "timeLimitSeconds": 90,
    "followUpQuestions": [
      {
        "text": "Can you give a more specific example related to: Describe your ideal manager.?",
        "textAr": "هل يمكنك إعطاء مثال أكثر تحديداً بخصوص: صف مديرك المثالي.؟"
      }
    ],
    "evaluationRubric": {
      "criteria": [
        {
          "name": "Content relevance",
          "weight": 3
        },
        {
          "name": "Structure / STAR",
          "weight": 3
        },
        {
          "name": "Evidence & metrics",
          "weight": 2
        },
        {
          "name": "Delivery clarity",
          "weight": 2
        }
      ],
      "total": 10
    },
    "coachingTips": [
      "Be specific with one concrete example",
      "Explain trade-offs clearly"
    ]
  },
  {
    "questionText": "What would you do in your first 30 days in this role?",
    "questionTextAr": "ماذا ستفعل في أول ٣٠ يوماً في هذا الدور؟",
    "answerTemplate": "Listen and learn systems/stakeholders, clarify success metrics, deliver a small win, and propose a 90-day plan.",
    "answerTemplateAr": "أستمع وأتعلّم الأنظمة/أصحاب المصلحة، وأوضّح مقاييس النجاح، وأحقّق مكسباً صغيراً، وأقترح خطة لـ٩٠ يوماً.",
    "roleCategory": "general",
    "seniorityLevel": "mid",
    "questionType": "situational",
    "interviewRound": "behavioral",
    "difficulty": "medium",
    "tags": [
      "onboarding"
    ],
    "timeLimitSeconds": 180,
    "followUpQuestions": [
      {
        "text": "Can you give a more specific example related to: What would you do in your first 30 days in this role??",
        "textAr": "هل يمكنك إعطاء مثال أكثر تحديداً بخصوص: ماذا ستفعل في أول ٣٠ يوماً في هذا الدور؟؟"
      },
      {
        "text": "What was the measurable outcome?",
        "textAr": "ما كانت النتيجة القابلة للقياس؟"
      }
    ],
    "evaluationRubric": {
      "criteria": [
        {
          "name": "Content relevance",
          "weight": 3
        },
        {
          "name": "Structure / STAR",
          "weight": 3
        },
        {
          "name": "Evidence & metrics",
          "weight": 2
        },
        {
          "name": "Delivery clarity",
          "weight": 2
        }
      ],
      "total": 10
    },
    "coachingTips": [
      "Be specific with one concrete example",
      "Explain trade-offs clearly"
    ]
  },
  {
    "questionText": "How do you stay updated with industry trends?",
    "questionTextAr": "كيف تبقى مطّلعاً على اتجاهات الصناعة؟",
    "answerTemplate": "I follow [sources], join communities, run small experiments, and share learnings with my team.",
    "answerTemplateAr": "أتابع [مصادر]، وأنضم إلى مجتمعات، وأجرّب تجارب صغيرة، وأشارك التعلّم مع فريقي.",
    "roleCategory": "general",
    "seniorityLevel": "mid",
    "questionType": "behavioral",
    "interviewRound": "behavioral",
    "difficulty": "easy",
    "tags": [
      "learning"
    ],
    "timeLimitSeconds": 90,
    "followUpQuestions": [
      {
        "text": "Can you give a more specific example related to: How do you stay updated with industry trends??",
        "textAr": "هل يمكنك إعطاء مثال أكثر تحديداً بخصوص: كيف تبقى مطّلعاً على اتجاهات الصناعة؟؟"
      }
    ],
    "evaluationRubric": {
      "criteria": [
        {
          "name": "Content relevance",
          "weight": 3
        },
        {
          "name": "Structure / STAR",
          "weight": 3
        },
        {
          "name": "Evidence & metrics",
          "weight": 2
        },
        {
          "name": "Delivery clarity",
          "weight": 2
        }
      ],
      "total": 10
    },
    "coachingTips": [
      "Be specific with one concrete example",
      "Use STAR and finish with a result"
    ]
  },
  {
    "questionText": "Tell me about a time you had to persuade someone to see things your way.",
    "questionTextAr": "أخبرني عن مرة أقنعت فيها شخصاً برؤيتك.",
    "answerTemplate": "I understood their concerns, brought data/user evidence, proposed a low-risk experiment, and aligned on shared goals.",
    "answerTemplateAr": "فهمت مخاوفهم، وقدّمت بيانات/أدلة مستخدمين، واقترحت تجربة منخفضة المخاطر، وواءمنا على أهداف مشتركة.",
    "roleCategory": "general",
    "seniorityLevel": "mid",
    "questionType": "behavioral",
    "interviewRound": "behavioral",
    "difficulty": "medium",
    "tags": [
      "influence"
    ],
    "timeLimitSeconds": 180,
    "followUpQuestions": [
      {
        "text": "Can you give a more specific example related to: Tell me about a time you had to persuade someone to see thin?",
        "textAr": "هل يمكنك إعطاء مثال أكثر تحديداً بخصوص: أخبرني عن مرة أقنعت فيها شخصاً برؤيتك.؟"
      },
      {
        "text": "What was the measurable outcome?",
        "textAr": "ما كانت النتيجة القابلة للقياس؟"
      }
    ],
    "evaluationRubric": {
      "criteria": [
        {
          "name": "Content relevance",
          "weight": 3
        },
        {
          "name": "Structure / STAR",
          "weight": 3
        },
        {
          "name": "Evidence & metrics",
          "weight": 2
        },
        {
          "name": "Delivery clarity",
          "weight": 2
        }
      ],
      "total": 10
    },
    "coachingTips": [
      "Be specific with one concrete example",
      "Use STAR and finish with a result"
    ]
  },
  {
    "questionText": "What is your approach to continuous learning?",
    "questionTextAr": "ما منهجك في التعلّم المستمر؟",
    "answerTemplate": "I set quarterly skill goals, learn by building, seek feedback, and teach others to reinforce mastery.",
    "answerTemplateAr": "أضع أهداف مهارات ربع سنوية، وأتعلّم بالبناء، وأطلب ملاحظات، وأعلّم الآخرين لتعزيز الإتقان.",
    "roleCategory": "general",
    "seniorityLevel": "entry",
    "questionType": "cultural_fit",
    "interviewRound": "phone_screen",
    "difficulty": "easy",
    "tags": [
      "growth"
    ],
    "timeLimitSeconds": 90,
    "followUpQuestions": [
      {
        "text": "Can you give a more specific example related to: What is your approach to continuous learning??",
        "textAr": "هل يمكنك إعطاء مثال أكثر تحديداً بخصوص: ما منهجك في التعلّم المستمر؟؟"
      }
    ],
    "evaluationRubric": {
      "criteria": [
        {
          "name": "Content relevance",
          "weight": 3
        },
        {
          "name": "Structure / STAR",
          "weight": 3
        },
        {
          "name": "Evidence & metrics",
          "weight": 2
        },
        {
          "name": "Delivery clarity",
          "weight": 2
        }
      ],
      "total": 10
    },
    "coachingTips": [
      "Be specific with one concrete example",
      "Explain trade-offs clearly"
    ]
  }
] as const;

export async function seedInterviewQuestions(client: PrismaClient = prisma) {
  const existing = await client.interviewQuestion.count().catch(() => 0);
  if (existing >= 50) {
    console.log(`Interview questions already seeded (${existing}). Skipping.`);
    return existing;
  }

  // Clear partial seed if any
  if (existing > 0) {
    await client.interviewResponse.deleteMany().catch(() => undefined);
    await client.interviewQuestion.deleteMany();
  }

  await client.interviewQuestion.createMany({
    data: INTERVIEW_SEED_QUESTIONS.map((q) => ({
      questionText: q.questionText,
      questionTextAr: q.questionTextAr,
      answerTemplate: q.answerTemplate,
      answerTemplateAr: q.answerTemplateAr,
      roleCategory: q.roleCategory,
      seniorityLevel: q.seniorityLevel,
      questionType: q.questionType,
      interviewRound: q.interviewRound,
      difficulty: q.difficulty,
      tags: [...q.tags],
      followUpQuestions: q.followUpQuestions,
      evaluationRubric: q.evaluationRubric,
      timeLimitSeconds: q.timeLimitSeconds,
      coachingTips: [...q.coachingTips],
    })),
  });

  const count = await client.interviewQuestion.count();
  console.log(`Seeded ${count} interview questions.`);
  return count;
}

async function main() {
  await seedInterviewQuestions();
}

const isDirect = process.argv[1]?.includes('seed-interview-questions');
if (isDirect) {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
