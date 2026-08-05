const fs = require("fs");
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require("docx");

const doc = new Document({
    creator: "System",
    title: "How to become a Trainer On ezyLern",
    description: "Guide for Sumedh - Algo Trading Course",
    sections: [
        {
            properties: {},
            children: [
                new Paragraph({
                    text: "How to become a Trainer On ezyLern",
                    heading: HeadingLevel.HEADING_1,
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "First, go to the official ezyLern website and click on “Become a Trainer.”",
                            size: 28,
                        }),
                    ],
                    spacing: { before: 200, after: 200 },
                }),
                new Paragraph({
                    text: "[Placeholder: Screenshot of ezyLern homepage highlighting 'Become a trainer' button]",
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "click on “Join ezylern’s teaching Community Today.”",
                            size: 28,
                        }),
                    ],
                    spacing: { before: 200, after: 200 },
                }),
                new Paragraph({
                    text: "[Placeholder: Screenshot highlighting 'Join ezylern's teaching community today!' button]",
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 },
                }),

                // Page 2
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "And then Enter Your “Email Address”",
                            size: 28,
                        }),
                    ],
                    spacing: { before: 400, after: 200 },
                }),
                new Paragraph({
                    text: "[Placeholder: Screenshot of Email input field]",
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "And when You Enter Your Email and Click On OTP you will get a OTP on You Enterd Email Address.",
                            size: 28,
                        }),
                    ],
                    spacing: { before: 200, after: 200 },
                }),
                new Paragraph({
                    text: "[Placeholder: Screenshot of OTP input field]",
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "This is Trainer Dashboard, Where You can see Everything about Your Course?",
                            size: 28,
                        }),
                    ],
                    spacing: { before: 200, after: 200 },
                }),
                new Paragraph({
                    text: "[Placeholder: Screenshot of Trainer Dashboard overview]",
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 },
                }),

                // Page 3
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "And Now Click On Create Course, where you Create your Own Course on ezyLern.",
                            size: 28,
                        }),
                    ],
                    spacing: { before: 400, after: 200 },
                }),
                new Paragraph({
                    text: "[Placeholder: Screenshot of sidebar highlighting 'Create Course']",
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "And Now Click On Create New Course.",
                            size: 28,
                        }),
                    ],
                    spacing: { before: 200, after: 200 },
                }),
                new Paragraph({
                    text: "[Placeholder: Screenshot highlighting '+ Create New Course' button]",
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 },
                }),

                // Page 4
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "Here You can see this Interface. Fill in all the required input fields, then click the “Create Course” button.",
                            size: 28,
                        }),
                    ],
                    spacing: { before: 400, after: 200 },
                }),
                new Paragraph({
                    text: "[Placeholder: Screenshot of Course Creation Form for Algo Trading Course]",
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "And Now You Can See You Course Visible On Your Screen. From here, you can edit this Course Name, or delete it.",
                            size: 28,
                        }),
                    ],
                    spacing: { before: 200, after: 200 },
                }),
                new Paragraph({
                    text: "[Placeholder: Screenshot of course listed in dashboard (Algo Trading Course)]",
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 },
                }),

                // Page 5
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "Now, click the “Upload Video” button to upload your video.",
                            size: 28,
                        }),
                    ],
                    spacing: { before: 400, after: 200 },
                }),
                new Paragraph({
                    text: "[Placeholder: Screenshot highlighting 'Upload Videos' button]",
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "Here You can see this Interface. then click the “Add section” button",
                            size: 28,
                        }),
                    ],
                    spacing: { before: 200, after: 200 },
                }),
                new Paragraph({
                    text: "[Placeholder: Screenshot highlighting '+ Add Section' button]",
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 },
                }),

                // Page 6
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "Fill in all the required fields, then click on the “Add Section” button.",
                            size: 28,
                        }),
                    ],
                    spacing: { before: 400, after: 200 },
                }),
                new Paragraph({
                    text: "[Placeholder: Screenshot of 'Add New Section' modal]",
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "Here, you will see this interface.",
                            size: 28,
                        }),
                    ],
                    spacing: { before: 200, after: 200 },
                }),
                new Paragraph({
                    text: "[Placeholder: Screenshot showing newly created section]",
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 },
                }),

                // Page 7
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "Click on the “Add Material” button. To add your Video PDF, Doc, Image, Url etc..",
                            size: 28,
                        }),
                    ],
                    spacing: { before: 400, after: 200 },
                }),
                new Paragraph({
                    text: "[Placeholder: Screenshot of 'Add Material' selection modal]",
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "Here, you can see that the video has been uploaded successfully. From here, you can edit the video, change its name, or delete it.",
                            size: 28,
                        }),
                    ],
                    spacing: { before: 200, after: 200 },
                }),
                new Paragraph({
                    text: "[Placeholder: Screenshot showing the uploaded video row in the section]",
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 },
                }),

                // Page 8
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "And From Learners List, you can see who has purchased your course.",
                            size: 28,
                        }),
                    ],
                    spacing: { before: 400, after: 200 },
                }),
                new Paragraph({
                    text: "[Placeholder: Screenshot of 'Students Enrolled' list]",
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "And From Cuppon Code, you can also run a special offer on your course.",
                            size: 28,
                        }),
                    ],
                    spacing: { before: 200, after: 200 },
                }),
                new Paragraph({
                    text: "[Placeholder: Screenshot of 'Course Coupons' dashboard]",
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 },
                }),

                // Page 9
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "When you click the “Create Your Website” button, you will see this interface. Fill in all the required information that you want to display on your website. Then, scroll down to preview your website. Once everything looks good, click the “Update and Publish” button to publish it.",
                            size: 28,
                        }),
                    ],
                    spacing: { before: 400, after: 200 },
                }),
                new Paragraph({
                    text: "[Placeholder: Screenshot of 'Create Your Website' FAQ section]",
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 },
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "click the “Update and Publish” button to publish it.",
                            size: 28,
                        }),
                    ],
                    spacing: { before: 200, after: 200 },
                }),
                new Paragraph({
                    text: "[Placeholder: Screenshot highlighting 'UPDATE & PUBLISH' button]",
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 },
                }),
            ],
        },
    ],
});

Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync("SUMEDH_ALGO_TRADING_COURSE_GUIDE.docx", buffer);
    console.log("Document generated successfully!");
});
