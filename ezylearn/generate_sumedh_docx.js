const fs = require("fs");
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  ImageRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ShadingType,
  PageBreak,
  TabStopPosition,
  TabStopType,
  convertInchesToTwip,
} = require("docx");

// Load the profile image
const profileImagePath =
  "C:\\Users\\mahaj\\Desktop\\sumedhhkumar-website\\public\\images\\sumedhhkumar-bhalerao-profile.png";
const profileImageBuffer = fs.readFileSync(profileImagePath);

// Helper: horizontal rule
function horizontalRule() {
  return new Paragraph({
    border: {
      bottom: {
        color: "999999",
        style: BorderStyle.SINGLE,
        size: 6,
        space: 1,
      },
    },
    spacing: { before: 200, after: 200 },
  });
}

// Helper: blank line
function blankLine() {
  return new Paragraph({ text: "", spacing: { before: 100, after: 100 } });
}

// Helper: section heading
function sectionHeading(text) {
  return new Paragraph({
    children: [
      new TextRun({
        text: text,
        bold: true,
        size: 32,
        color: "1A1A2E",
        font: "Calibri",
      }),
    ],
    spacing: { before: 300, after: 200 },
  });
}

// Helper: body paragraph
function bodyParagraph(text, options = {}) {
  return new Paragraph({
    children: [
      new TextRun({
        text: text,
        size: 24,
        font: "Calibri",
        color: options.color || "333333",
        bold: options.bold || false,
        italics: options.italics || false,
      }),
    ],
    spacing: { before: 100, after: 100 },
    alignment: options.alignment || AlignmentType.LEFT,
  });
}

// Helper: bullet point
function bulletPoint(text, options = {}) {
  return new Paragraph({
    children: [
      new TextRun({
        text: "• " + text,
        size: 24,
        font: "Calibri",
        color: options.color || "333333",
      }),
    ],
    spacing: { before: 60, after: 60 },
    indent: { left: convertInchesToTwip(0.3) },
  });
}

// Helper: bold label + value
function labelValue(label, value) {
  return new Paragraph({
    children: [
      new TextRun({
        text: label,
        bold: true,
        size: 24,
        font: "Calibri",
        color: "1A1A2E",
      }),
      new TextRun({
        text: value,
        size: 24,
        font: "Calibri",
        color: "333333",
      }),
    ],
    spacing: { before: 60, after: 60 },
    indent: { left: convertInchesToTwip(0.3) },
  });
}

// No border style for tables
const noBorder = {
  top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
};

const doc = new Document({
  creator: "Sumedhhkumar Bhalerao",
  title: "Sumedhhkumar Bhalerao - Vyntegra Trading Automation Masterclass - ezyLern Trainer Profile",
  description: "Trainer onboarding document for ezyLern",
  styles: {
    default: {
      document: {
        run: {
          font: "Calibri",
          size: 24,
        },
      },
    },
  },
  sections: [
    {
      properties: {
        page: {
          margin: {
            top: convertInchesToTwip(1),
            right: convertInchesToTwip(1),
            bottom: convertInchesToTwip(1),
            left: convertInchesToTwip(1),
          },
        },
      },
      children: [
        // ============================================================
        // HEADER STRIP SECTION
        // ============================================================
        new Paragraph({
          children: [
            new TextRun({
              text: "The upper strip should be in deep blue color. Sample is given below.",
              italics: true,
              size: 22,
              font: "Calibri",
              color: "666666",
            }),
          ],
          spacing: { after: 200 },
        }),

        // Contact & Social info
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: noBorder,
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  borders: noBorder,
                  shading: {
                    type: ShadingType.SOLID,
                    color: "0D1B2A",
                    fill: "0D1B2A",
                  },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "Contact & WhatsApp No - +91 8999577757",
                          color: "FFFFFF",
                          size: 22,
                          font: "Calibri",
                        }),
                      ],
                      spacing: { before: 100, after: 100 },
                    }),
                  ],
                }),
                new TableCell({
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  borders: noBorder,
                  shading: {
                    type: ShadingType.SOLID,
                    color: "0D1B2A",
                    fill: "0D1B2A",
                  },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "Email id – (to be updated)",
                          color: "FFFFFF",
                          size: 22,
                          font: "Calibri",
                        }),
                      ],
                      spacing: { before: 100, after: 100 },
                      alignment: AlignmentType.RIGHT,
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),

        blankLine(),

        // Social Links
        labelValue("My YouTube Channel link: ", "https://www.youtube.com/@Sumedhhkumar/"),
        labelValue("My LinkedIn Profile link: ", "https://www.linkedin.com/in/sumedhkumar-bhalerao/"),

        horizontalRule(),

        // ============================================================
        // LOGO SECTION
        // ============================================================
        new Paragraph({
          children: [
            new TextRun({
              text: "My Logo.",
              bold: true,
              size: 26,
              font: "Calibri",
              color: "1A1A2E",
            }),
          ],
          spacing: { before: 200, after: 100 },
        }),

        // Vyntegra "V" text logo representation
        new Table({
          width: { size: 30, type: WidthType.PERCENTAGE },
          borders: noBorder,
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  borders: noBorder,
                  shading: {
                    type: ShadingType.SOLID,
                    color: "090A0C",
                    fill: "090A0C",
                  },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "  V  ",
                          bold: true,
                          size: 72,
                          font: "Georgia",
                          color: "B8914A",
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                      spacing: { before: 100, after: 40 },
                    }),
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "VYNTEGRA",
                          bold: true,
                          size: 28,
                          font: "Calibri",
                          color: "B8914A",
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                      spacing: { before: 0, after: 100 },
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),

        horizontalRule(),

        // ============================================================
        // COURSE BANNER SECTION
        // ============================================================
        new Paragraph({
          children: [
            new TextRun({
              text: "Kindly add below image and write the below content from left side.",
              italics: true,
              size: 22,
              font: "Calibri",
              color: "666666",
            }),
          ],
          spacing: { after: 200 },
        }),

        // Course title block
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: noBorder,
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  borders: noBorder,
                  shading: {
                    type: ShadingType.SOLID,
                    color: "0D1B2A",
                    fill: "0D1B2A",
                  },
                  children: [
                    blankLine(),
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "Trading Automation Masterclass",
                          bold: true,
                          size: 48,
                          font: "Calibri",
                          color: "FFFFFF",
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                      spacing: { before: 200, after: 100 },
                    }),
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "(MT5 | TradingView | Alerts | Automation Workflows)",
                          bold: true,
                          size: 28,
                          font: "Calibri",
                          color: "B8914A",
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                      spacing: { before: 100, after: 100 },
                    }),
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "By Sumedhhkumar Bhalerao | Vyntegra",
                          size: 26,
                          font: "Calibri",
                          color: "CCCCCC",
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                      spacing: { before: 100, after: 100 },
                    }),
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "Learn how trading automation workflows are planned, set up, tested, and understood using MT5 and TradingView. A practical, structured, weekend program with live sessions, recordings, and WhatsApp support.",
                          size: 22,
                          font: "Calibri",
                          color: "DDDDDD",
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                      spacing: { before: 100, after: 200 },
                      indent: {
                        left: convertInchesToTwip(0.5),
                        right: convertInchesToTwip(0.5),
                      },
                    }),
                    blankLine(),
                  ],
                }),
              ],
            }),
          ],
        }),

        horizontalRule(),

        // ============================================================
        // ABOUT ME SECTION
        // ============================================================
        sectionHeading("About Me"),

        // Profile image
        new Paragraph({
          children: [
            new ImageRun({
              data: profileImageBuffer,
              transformation: { width: 180, height: 180 },
              type: "png",
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 200 },
        }),

        bodyParagraph(
          "I am Sumedhhkumar Bhalerao, a Data Scientist and the Founder of Vyntegra. My professional journey spans hands-on work across generative AI, conversational AI, NLP, machine learning, SQL, cloud platforms, and operations-led business systems."
        ),
        blankLine(),
        bodyParagraph(
          "My professional experience includes data science work at Builder.ai, supply-chain analysis at Reliance Retail, data-science training and product demonstrations at Skillcart E-Learning, and operations roles across EATCLUB Brands and RIVIGO."
        ),
        blankLine(),
        bodyParagraph(
          "At Vyntegra, I bring that mix of AI capability, product thinking, database fluency, and execution discipline into practical digital solutions. I focus on turning broad customer requirements into clear product scope, usable workflows, automation opportunities, trading-software concepts, and implementation plans that can move from idea to working system."
        ),
        blankLine(),
        bodyParagraph(
          "I am passionate about education and firmly believe in structured, practical learning — bridging the gap between theory and real-world application. My training style is focused on building clear understanding, step-by-step workflows, responsible implementation thinking, and hands-on practice.",
          { italics: true }
        ),

        horizontalRule(),

        // ============================================================
        // EXPERIENCE / SPECIALIZATION / INDUSTRY
        // ============================================================
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: noBorder,
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 33, type: WidthType.PERCENTAGE },
                  borders: noBorder,
                  shading: {
                    type: ShadingType.SOLID,
                    color: "EBF0F7",
                    fill: "EBF0F7",
                  },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "Experience",
                          size: 20,
                          font: "Calibri",
                          color: "666666",
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                      spacing: { before: 100, after: 40 },
                    }),
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "4+ years",
                          bold: true,
                          size: 26,
                          font: "Calibri",
                          color: "1A1A2E",
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                      spacing: { before: 40, after: 100 },
                    }),
                  ],
                }),
                new TableCell({
                  width: { size: 34, type: WidthType.PERCENTAGE },
                  borders: noBorder,
                  shading: {
                    type: ShadingType.SOLID,
                    color: "EBF0F7",
                    fill: "EBF0F7",
                  },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "Specialization",
                          size: 20,
                          font: "Calibri",
                          color: "666666",
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                      spacing: { before: 100, after: 40 },
                    }),
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "Trading Automation, AI/ML",
                          bold: true,
                          size: 26,
                          font: "Calibri",
                          color: "1A1A2E",
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                      spacing: { before: 40, after: 100 },
                    }),
                  ],
                }),
                new TableCell({
                  width: { size: 33, type: WidthType.PERCENTAGE },
                  borders: noBorder,
                  shading: {
                    type: ShadingType.SOLID,
                    color: "EBF0F7",
                    fill: "EBF0F7",
                  },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "Industry",
                          size: 20,
                          font: "Calibri",
                          color: "666666",
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                      spacing: { before: 100, after: 40 },
                    }),
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "IT",
                          bold: true,
                          size: 26,
                          font: "Calibri",
                          color: "1A1A2E",
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                      spacing: { before: 40, after: 100 },
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),

        horizontalRule(),

        // ============================================================
        // STATS SECTION (matching Satish's 50K+, 100%, 100%)
        // ============================================================
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: noBorder,
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 100, type: WidthType.PERCENTAGE },
                  borders: noBorder,
                  shading: {
                    type: ShadingType.SOLID,
                    color: "0D1B2A",
                    fill: "0D1B2A",
                  },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "Trusted By Learners",
                          bold: true,
                          size: 36,
                          font: "Calibri",
                          color: "FFFFFF",
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                      spacing: { before: 200, after: 60 },
                    }),
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "Explore Industry Relevant & Career-Focused Online Learning From Working Professionals.",
                          size: 22,
                          font: "Calibri",
                          color: "CCCCCC",
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                      spacing: { before: 60, after: 200 },
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),

        blankLine(),

        // Stats row
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: noBorder,
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 33, type: WidthType.PERCENTAGE },
                  borders: noBorder,
                  shading: {
                    type: ShadingType.SOLID,
                    color: "162B44",
                    fill: "162B44",
                  },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "100%",
                          bold: true,
                          size: 44,
                          font: "Calibri",
                          color: "FFFFFF",
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                      spacing: { before: 150, after: 40 },
                    }),
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "Online Learning",
                          size: 22,
                          font: "Calibri",
                          color: "CCCCCC",
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                      spacing: { before: 40, after: 150 },
                    }),
                  ],
                }),
                new TableCell({
                  width: { size: 34, type: WidthType.PERCENTAGE },
                  borders: noBorder,
                  shading: {
                    type: ShadingType.SOLID,
                    color: "162B44",
                    fill: "162B44",
                  },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "100%",
                          bold: true,
                          size: 44,
                          font: "Calibri",
                          color: "FFFFFF",
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                      spacing: { before: 150, after: 40 },
                    }),
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "Career Assistance",
                          size: 22,
                          font: "Calibri",
                          color: "CCCCCC",
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                      spacing: { before: 40, after: 150 },
                    }),
                  ],
                }),
                new TableCell({
                  width: { size: 33, type: WidthType.PERCENTAGE },
                  borders: noBorder,
                  shading: {
                    type: ShadingType.SOLID,
                    color: "162B44",
                    fill: "162B44",
                  },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "3 Months",
                          bold: true,
                          size: 44,
                          font: "Calibri",
                          color: "FFFFFF",
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                      spacing: { before: 150, after: 40 },
                    }),
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: "Weekend Training",
                          size: 22,
                          font: "Calibri",
                          color: "CCCCCC",
                        }),
                      ],
                      alignment: AlignmentType.CENTER,
                      spacing: { before: 40, after: 150 },
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),

        horizontalRule(),

        // ============================================================
        // TRAINING FEATURES & BENEFITS
        // ============================================================
        sectionHeading("Training Features & Benefits"),
        bodyParagraph("What you will get with this training program", {
          bold: true,
          color: "555555",
        }),
        blankLine(),

        // 1. Course Hours
        new Paragraph({
          children: [
            new TextRun({
              text: "25+ Hours of Complete Trading Automation Training",
              bold: true,
              size: 26,
              font: "Calibri",
              color: "1A1A2E",
            }),
          ],
          spacing: { before: 200, after: 100 },
          bullet: { level: 0 },
        }),
        bodyParagraph(
          "Comprehensive coverage across 6 modules — from trading automation fundamentals and platform setup (MT5 + TradingView), to strategy logic, alert workflows, risk management, and deployment monitoring — with real project scenarios and practical exercises."
        ),
        blankLine(),

        // 2. Interview Questions
        new Paragraph({
          children: [
            new TextRun({
              text: "Structured Curriculum with 25 Lectures",
              bold: true,
              size: 26,
              font: "Calibri",
              color: "1A1A2E",
            }),
          ],
          spacing: { before: 200, after: 100 },
          bullet: { level: 0 },
        }),
        bodyParagraph(
          "Each lecture is designed with clear learning objectives, hands-on exercises, and step-by-step walkthroughs. Topics include Pine Script basics, webhook setup, backtesting, paper trading, position sizing, and end-to-end execution flow."
        ),
        blankLine(),

        // 3. Live Weekend Sessions
        new Paragraph({
          children: [
            new TextRun({
              text: "Live Weekend Sessions + Recordings",
              bold: true,
              size: 26,
              font: "Calibri",
              color: "1A1A2E",
            }),
          ],
          spacing: { before: 200, after: 100 },
          bullet: { level: 0 },
        }),
        bodyParagraph(
          "2 hours every weekend in a live, interactive format. All sessions are recorded so you can revisit and practice at your own pace. Ask questions in real time and get direct feedback."
        ),
        blankLine(),

        // 4. WhatsApp Support
        new Paragraph({
          children: [
            new TextRun({
              text: "WhatsApp Doubt Support",
              bold: true,
              size: 26,
              font: "Calibri",
              color: "1A1A2E",
            }),
          ],
          spacing: { before: 200, after: 100 },
          bullet: { level: 0 },
        }),
        bodyParagraph(
          "Get direct WhatsApp support for course-related questions, setup issues, and joining instructions. Quick responses to keep your learning on track without unnecessary delays."
        ),
        blankLine(),

        // 5. Free Preview
        new Paragraph({
          children: [
            new TextRun({
              text: "Free Preview — Lecture 1 + Lecture 2",
              bold: true,
              size: 26,
              font: "Calibri",
              color: "1A1A2E",
            }),
          ],
          spacing: { before: 200, after: 100 },
          bullet: { level: 0 },
        }),
        bodyParagraph(
          "Get access to the Course Roadmap and the First Teaching Session completely free before making any payment decision. Evaluate the learning style, content quality, and course structure first."
        ),
        blankLine(),

        // 6. Risk & Testing Focus
        new Paragraph({
          children: [
            new TextRun({
              text: "Risk Management & Testing Discipline",
              bold: true,
              size: 26,
              font: "Calibri",
              color: "1A1A2E",
            }),
          ],
          spacing: { before: 200, after: 100 },
          bullet: { level: 0 },
        }),
        bodyParagraph(
          "Dedicated modules on backtesting fundamentals, paper trading, position sizing, risk controls, and safety checks. Build responsible automation habits — not blind reliance on tools."
        ),

        horizontalRule(),

        // ============================================================
        // CURRICULUM OVERVIEW
        // ============================================================
        sectionHeading("Course Curriculum Overview"),

        // Module 1
        new Paragraph({
          children: [
            new TextRun({
              text: "Module 1 — Foundations & Course Overview",
              bold: true,
              size: 24,
              font: "Calibri",
              color: "1A1A2E",
            }),
          ],
          spacing: { before: 200, after: 80 },
        }),
        bulletPoint("Course roadmap and learning path"),
        bulletPoint("First teaching session and learning style"),
        bulletPoint("What trading automation means"),
        bulletPoint("Manual vs automated workflows"),
        blankLine(),

        // Module 2
        new Paragraph({
          children: [
            new TextRun({
              text: "Module 2 — Platform Setup & Configuration",
              bold: true,
              size: 24,
              font: "Calibri",
              color: "1A1A2E",
            }),
          ],
          spacing: { before: 200, after: 80 },
        }),
        bulletPoint("MT5 installation and orientation"),
        bulletPoint("TradingView account and chart setup"),
        bulletPoint("Broker connection and demo account"),
        bulletPoint("Platform integration checkpoint"),
        blankLine(),

        // Module 3
        new Paragraph({
          children: [
            new TextRun({
              text: "Module 3 — Strategy Logic & Indicators",
              bold: true,
              size: 24,
              font: "Calibri",
              color: "1A1A2E",
            }),
          ],
          spacing: { before: 200, after: 80 },
        }),
        bulletPoint("Moving averages and trend detection"),
        bulletPoint("RSI and momentum indicators"),
        bulletPoint("Applying indicators on charts"),
        bulletPoint("Building rule-based strategy notes"),
        bulletPoint("Strategy logic review and refinement"),
        blankLine(),

        // Module 4
        new Paragraph({
          children: [
            new TextRun({
              text: "Module 4 — Alert & Automation Workflows",
              bold: true,
              size: 24,
              font: "Calibri",
              color: "1A1A2E",
            }),
          ],
          spacing: { before: 200, after: 80 },
        }),
        bulletPoint("TradingView alerts deep dive"),
        bulletPoint("Webhook setup and signal flow"),
        bulletPoint("Pine Script basics for alerts"),
        bulletPoint("End-to-end execution flow"),
        blankLine(),

        // Module 5
        new Paragraph({
          children: [
            new TextRun({
              text: "Module 5 — Testing & Risk Management",
              bold: true,
              size: 24,
              font: "Calibri",
              color: "1A1A2E",
            }),
          ],
          spacing: { before: 200, after: 80 },
        }),
        bulletPoint("Backtesting fundamentals"),
        bulletPoint("Paper trading and forward testing"),
        bulletPoint("Position sizing and capital allocation"),
        bulletPoint("Risk controls and safety checks"),
        blankLine(),

        // Module 6
        new Paragraph({
          children: [
            new TextRun({
              text: "Module 6 — Deployment & Monitoring",
              bold: true,
              size: 24,
              font: "Calibri",
              color: "1A1A2E",
            }),
          ],
          spacing: { before: 200, after: 80 },
        }),
        bulletPoint("Going live checklist"),
        bulletPoint("Monitoring dashboards and alerts"),
        bulletPoint("Troubleshooting common issues"),
        bulletPoint("Course wrap-up and next steps"),

        horizontalRule(),

        // ============================================================
        // BANK DETAILS SECTION
        // ============================================================
        new Paragraph({
          children: [
            new TextRun({
              text: "Share your Bank Details where you want to credit your money",
              bold: true,
              size: 28,
              font: "Calibri",
              color: "1A1A2E",
            }),
          ],
          spacing: { before: 400, after: 300 },
        }),

        labelValue("Account Holder Name: ", "(to be updated)"),
        labelValue("Bank Name: ", "(to be updated)"),
        labelValue("Account Number: ", "(to be updated)"),
        labelValue("IFSC Code: ", "(to be updated)"),
        labelValue("Branch Name: ", "(to be updated)"),
        labelValue("Branch Address: ", "(to be updated)"),
        labelValue("PAN Card Number: ", "(to be updated)"),
        labelValue("Contact Number: ", "+91 8999577757"),
      ],
    },
  ],
});

// Generate the document
Packer.toBuffer(doc).then((buffer) => {
  const outputPath =
    "C:\\Users\\mahaj\\Desktop\\sumedhhkumar-website\\ezylearn\\SUMEDHHKUMAR BHALERAO TRADING AUTOMATION.docx";
  fs.writeFileSync(outputPath, buffer);
  console.log("Document generated successfully!");
  console.log("Output:", outputPath);
});
