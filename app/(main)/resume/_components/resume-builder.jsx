"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    AlertTriangle,
    Download,
    Edit,
    Loader2,
    Monitor,
    Save,
} from "lucide-react";
import { toast } from "sonner";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { saveResume } from "@/actions/resume";
import { EntryForm } from "./entry-form";
import useFetch from "@/hooks/use-fetch";
import { useUser } from "@clerk/nextjs";
import { entriesToMarkdown } from "@/app/lib/helper";
import { resumeSchema } from "@/app/lib/schema";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function ResumeBuilder({ initialContent }) {
    const [activeTab, setActiveTab] = useState("edit");
    const [previewContent, setPreviewContent] = useState(initialContent);
    const { user } = useUser();
    const [resumeMode, setResumeMode] = useState("preview");

    const {
        control,
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(resumeSchema),
        defaultValues: {
            contactInfo: {},
            summary: "",
            skills: "",
            experience: [],
            education: [],
            projects: [],
        },
    });

    const {
        loading: isSaving,
        fn: saveResumeFn,
        data: saveResult,
        error: saveError,
    } = useFetch(saveResume);

    // Watch form fields for preview updates
    const formValues = watch();

    useEffect(() => {
        if (initialContent) setActiveTab("preview");
    }, [initialContent]);

    // Update preview content when form values change
    useEffect(() => {
        if (activeTab === "edit") {
            const newContent = getCombinedContent();
            setPreviewContent(newContent ? newContent : initialContent);
        }
    }, [formValues, activeTab]);

    // Handle save result
    useEffect(() => {
        if (saveResult && !isSaving) {
            toast.success("Resume saved successfully!");
        }
        if (saveError) {
            toast.error(saveError.message || "Failed to save resume");
        }
    }, [saveResult, saveError, isSaving]);

    const getContactMarkdown = () => {
        const { contactInfo } = formValues;
        const parts = [];
        if (contactInfo.email) parts.push(`📧 ${contactInfo.email}`);
        if (contactInfo.mobile) parts.push(`📱 ${contactInfo.mobile}`);
        if (contactInfo.linkedin)
            parts.push(`💼 [LinkedIn](${contactInfo.linkedin})`);
        if (contactInfo.twitter) parts.push(`🐦 [Twitter](${contactInfo.twitter})`);

        return parts.length > 0
            ? `## <div align="center">${user.fullName}</div>
        \n\n<div align="center">\n\n${parts.join(" | ")}\n\n</div>`
            : "";
    };

    const getCombinedContent = () => {
        const { summary, skills, experience, education, projects } = formValues;
        return [
            getContactMarkdown(),
            summary && `## Professional Summary\n\n${summary}`,
            skills && `## Skills\n\n${skills}`,
            entriesToMarkdown(experience, "Work Experience"),
            entriesToMarkdown(education, "Education"),
            entriesToMarkdown(projects, "Projects"),
        ]
            .filter(Boolean)
            .join("\n\n");
    };

    const [isGenerating, setIsGenerating] = useState(false);

    const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const element = document.getElementById("resume-pdf");
      
      if (!element) {
        throw new Error("Resume content not found. Please make sure you're on the preview tab.");
      }

      // Create a new window for printing
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      
      if (!printWindow) {
        throw new Error("Pop-up blocked. Please allow pop-ups and try again.");
      }

      // Create clean HTML content for printing
      const cleanContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Resume</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: Arial, sans-serif;
              font-size: 12px;
              line-height: 1.4;
              color: #000;
              background: #fff;
              padding: 20px;
            }
            
            h1, h2, h3, h4, h5, h6 {
              color: #333;
              margin: 10px 0 5px 0;
              font-weight: bold;
            }
            
            h1 { font-size: 24px; }
            h2 { font-size: 18px; }
            h3 { font-size: 16px; }
            h4, h5, h6 { font-size: 14px; }
            
            p {
              margin: 5px 0;
            }
            
            a {
              color: #0066cc;
              text-decoration: underline;
            }
            
            ul, ol {
              margin: 10px 0 10px 20px;
            }
            
            li {
              margin: 2px 0;
            }
            
            strong, b {
              font-weight: bold;
              color: #000;
            }
            
            em, i {
              font-style: italic;
            }
            
            code {
              background: #f5f5f5;
              padding: 2px 4px;
              font-family: monospace;
            }
            
            pre {
              background: #f5f5f5;
              padding: 10px;
              margin: 10px 0;
              overflow: auto;
            }
            
            blockquote {
              border-left: 3px solid #ccc;
              padding-left: 15px;
              margin: 10px 0;
              color: #666;
            }
            
            table {
              border-collapse: collapse;
              width: 100%;
              margin: 10px 0;
            }
            
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            
            th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            
            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          ${element.innerHTML.replace(/style="[^"]*"/g, '').replace(/class="[^"]*"/g, '')}
        </body>
        </html>
      `;

      printWindow.document.write(cleanContent);
      printWindow.document.close();

      // Wait for content to load
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          setTimeout(() => {
            printWindow.close();
            setIsGenerating(false);
            toast.success("Print dialog opened. Choose 'Save as PDF' in your printer options.");
          }, 100);
        }, 500);
      };

      // Fallback if onload doesn't fire
      setTimeout(() => {
        if (printWindow && !printWindow.closed) {
          printWindow.print();
          setTimeout(() => {
            printWindow.close();
            setIsGenerating(false);
            toast.success("Print dialog opened. Choose 'Save as PDF' in your printer options.");
          }, 100);
        }
      }, 1000);

    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF. Please try again.");
      setIsGenerating(false);
    }
  };
    const onSubmit = async (data) => {
        try {
            const formattedContent = previewContent
                .replace(/\n/g, "\n") // Normalize newlines
                .replace(/\n\s*\n/g, "\n\n") // Normalize multiple newlines to double newlines
                .trim();

            console.log(previewContent, formattedContent);
            await saveResumeFn(previewContent);
        } catch (error) {
            console.error("Save error:", error);
        }
    };

    return (
        <div data-color-mode="light" className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-2">
                <h1 className="font-bold gradient-title text-5xl md:text-6xl">
                    Resume Builder
                </h1>
                <div className="space-x-2">
                    <Button
                        variant="destructive"
                        onClick={handleSubmit(onSubmit)}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                Save
                            </>
                        )}
                    </Button>
                    <Button onClick={generatePDF} disabled={isGenerating}>
                        {isGenerating ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Generating PDF...
                            </>
                        ) : (
                            <>
                                <Download className="h-4 w-4" />
                                Download PDF
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="edit">Form</TabsTrigger>
                    <TabsTrigger value="preview">Markdown</TabsTrigger>
                </TabsList>

                <TabsContent value="edit">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        {/* Contact Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Contact Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email</label>
                                    <Input
                                        {...register("contactInfo.email")}
                                        type="email"
                                        placeholder="your@email.com"
                                        error={errors.contactInfo?.email}
                                    />
                                    {errors.contactInfo?.email && (
                                        <p className="text-sm text-red-500">
                                            {errors.contactInfo.email.message}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Mobile Number</label>
                                    <Input
                                        {...register("contactInfo.mobile")}
                                        type="tel"
                                        placeholder="+1 234 567 8900"
                                    />
                                    {errors.contactInfo?.mobile && (
                                        <p className="text-sm text-red-500">
                                            {errors.contactInfo.mobile.message}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">LinkedIn URL</label>
                                    <Input
                                        {...register("contactInfo.linkedin")}
                                        type="url"
                                        placeholder="https://linkedin.com/in/your-profile"
                                    />
                                    {errors.contactInfo?.linkedin && (
                                        <p className="text-sm text-red-500">
                                            {errors.contactInfo.linkedin.message}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Twitter/X Profile
                                    </label>
                                    <Input
                                        {...register("contactInfo.twitter")}
                                        type="url"
                                        placeholder="https://twitter.com/your-handle"
                                    />
                                    {errors.contactInfo?.twitter && (
                                        <p className="text-sm text-red-500">
                                            {errors.contactInfo.twitter.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Professional Summary</h3>
                            <Controller
                                name="summary"
                                control={control}
                                render={({ field }) => (
                                    <Textarea
                                        {...field}
                                        className="h-32"
                                        placeholder="Write a compelling professional summary..."
                                        error={errors.summary}
                                    />
                                )}
                            />
                            {errors.summary && (
                                <p className="text-sm text-red-500">{errors.summary.message}</p>
                            )}
                        </div>

                        {/* Skills */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Skills</h3>
                            <Controller
                                name="skills"
                                control={control}
                                render={({ field }) => (
                                    <Textarea
                                        {...field}
                                        className="h-32"
                                        placeholder="List your key skills..."
                                        error={errors.skills}
                                    />
                                )}
                            />
                            {errors.skills && (
                                <p className="text-sm text-red-500">{errors.skills.message}</p>
                            )}
                        </div>

                        {/* Experience */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Work Experience</h3>
                            <Controller
                                name="experience"
                                control={control}
                                render={({ field }) => (
                                    <EntryForm
                                        type="Experience"
                                        entries={field.value}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                            {errors.experience && (
                                <p className="text-sm text-red-500">
                                    {errors.experience.message}
                                </p>
                            )}
                        </div>

                        {/* Education */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Education</h3>
                            <Controller
                                name="education"
                                control={control}
                                render={({ field }) => (
                                    <EntryForm
                                        type="Education"
                                        entries={field.value}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                            {errors.education && (
                                <p className="text-sm text-red-500">
                                    {errors.education.message}
                                </p>
                            )}
                        </div>

                        {/* Projects */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Projects</h3>
                            <Controller
                                name="projects"
                                control={control}
                                render={({ field }) => (
                                    <EntryForm
                                        type="Project"
                                        entries={field.value}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                            {errors.projects && (
                                <p className="text-sm text-red-500">
                                    {errors.projects.message}
                                </p>
                            )}
                        </div>
                    </form>
                </TabsContent>

                <TabsContent value="preview">
                    {activeTab === "preview" && (
                        <Button
                            variant="link"
                            type="button"
                            className="mb-2"
                            onClick={() =>
                                setResumeMode(resumeMode === "preview" ? "edit" : "preview")
                            }
                        >
                            {resumeMode === "preview" ? (
                                <>
                                    <Edit className="h-4 w-4" />
                                    Edit Resume
                                </>
                            ) : (
                                <>
                                    <Monitor className="h-4 w-4" />
                                    Show Preview
                                </>
                            )}
                        </Button>
                    )}

                    {activeTab === "preview" && resumeMode !== "preview" && (
                        <div className="flex p-3 gap-2 items-center border-2 border-yellow-600 text-yellow-600 rounded mb-2">
                            <AlertTriangle className="h-5 w-5" />
                            <span className="text-sm">
                                You will lose editied markdown if you update the form data.
                            </span>
                        </div>
                    )}
                    <div className="border rounded-lg">
                        <MDEditor
                            value={previewContent}
                            onChange={setPreviewContent}
                            height={800}
                            preview={resumeMode}
                        />
                    </div>
                    <div className="hidden">
                        <div id="resume-pdf">
                            <MDEditor.Markdown
                                source={previewContent}
                                style={{
                                    background: "white",
                                    color: "black",
                                }}
                            />
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
