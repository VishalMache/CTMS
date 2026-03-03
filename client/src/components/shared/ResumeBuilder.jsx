// ============================================================
// CPMS – ATS-Verified Resume Builder Component
// Multi-step form that generates a professional PDF resume
// ============================================================

import React, { useState } from 'react'
import {
    FileText, User, Briefcase, GraduationCap, Code2, Award,
    ChevronLeft, ChevronRight, Download, Sparkles, Plus, Trash2,
    CheckCircle2, Lightbulb, Target, Zap
} from 'lucide-react'
import { Card, Button, Input, Label, Badge } from '@/components/ui'
import { jsPDF } from 'jspdf'

// ── Step definitions ─────────────────────────────────────────
const STEPS = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'skills', label: 'Skills', icon: Code2 },
    { id: 'projects', label: 'Projects', icon: Target },
    { id: 'certifications', label: 'Certifications', icon: Award },
    { id: 'preview', label: 'Preview & Download', icon: Download },
]

// ── ATS keyword suggestions by domain ────────────────────────
const ATS_KEYWORDS = {
    'Software Engineering': ['Agile', 'REST API', 'CI/CD', 'Microservices', 'Unit Testing', 'Code Review', 'Version Control', 'Data Structures', 'Algorithms', 'System Design'],
    'Data Science': ['Machine Learning', 'Deep Learning', 'Data Analysis', 'Python', 'TensorFlow', 'NLP', 'Statistical Modeling', 'Big Data', 'Data Visualization', 'Feature Engineering'],
    'Web Development': ['React', 'Node.js', 'JavaScript', 'TypeScript', 'RESTful APIs', 'Responsive Design', 'Git', 'MongoDB', 'SQL', 'Performance Optimization'],
    'Cloud & DevOps': ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Jenkins', 'Linux', 'Monitoring', 'Infrastructure as Code', 'Scalability', 'Networking'],
    'General': ['Problem-solving', 'Team Collaboration', 'Communication', 'Leadership', 'Time Management', 'Critical Thinking', 'Adaptability', 'Detail-oriented', 'Project Management', 'Cross-functional'],
}

// ── Initial form state ───────────────────────────────────────
const initialState = {
    personal: {
        fullName: '',
        email: '',
        phone: '',
        linkedin: '',
        github: '',
        portfolio: '',
        location: '',
        summary: '',
    },
    education: [
        {
            institution: '',
            degree: '',
            field: '',
            startYear: '',
            endYear: '',
            cgpa: '',
            relevantCourses: '',
        },
    ],
    experience: [
        {
            company: '',
            role: '',
            startDate: '',
            endDate: '',
            current: false,
            description: '',
            achievements: '',
        },
    ],
    skills: {
        technical: '',
        frameworks: '',
        tools: '',
        languages: '',
        soft: '',
        domain: 'General',
    },
    projects: [
        {
            name: '',
            techStack: '',
            description: '',
            link: '',
        },
    ],
    certifications: [
        {
            name: '',
            issuer: '',
            date: '',
            credentialId: '',
        },
    ],
}

// ── Stepper Progress Bar ─────────────────────────────────────
const StepperBar = ({ currentStep, setStep }) => (
    <div className="mb-8">
        {/* Desktop stepper */}
        <div className="hidden md:flex items-center justify-between relative">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200 z-0" />
            <div
                className="absolute top-5 left-0 h-0.5 z-0 transition-all duration-500"
                style={{
                    width: `${(currentStep / (STEPS.length - 1)) * 100}%`,
                    background: 'linear-gradient(90deg, #0d9488, #10b981)',
                }}
            />
            {STEPS.map((step, idx) => {
                const Icon = step.icon
                const isActive = idx === currentStep
                const isDone = idx < currentStep

                return (
                    <button
                        key={step.id}
                        onClick={() => idx <= currentStep && setStep(idx)}
                        className={`
              relative z-10 flex flex-col items-center gap-2 transition-all duration-300 cursor-pointer
              ${idx <= currentStep ? '' : 'opacity-50 pointer-events-none'}
            `}
                    >
                        <div
                            className={`
                w-10 h-10 rounded-full flex items-center justify-center ring-4 ring-white shadow-sm transition-all duration-300
                ${isActive ? 'bg-teal-600 text-white scale-110 shadow-teal-500/30 shadow-lg' : ''}
                ${isDone ? 'bg-emerald-500 text-white' : ''}
                ${!isActive && !isDone ? 'bg-slate-200 text-slate-400' : ''}
              `}
                        >
                            {isDone ? <CheckCircle2 size={18} /> : <Icon size={18} />}
                        </div>
                        <span
                            className={`text-xs font-medium whitespace-nowrap transition-colors duration-300 ${isActive ? 'text-teal-700 font-semibold' : isDone ? 'text-emerald-600' : 'text-slate-400'
                                }`}
                        >
                            {step.label}
                        </span>
                    </button>
                )
            })}
        </div>
        {/* Mobile stepper */}
        <div className="md:hidden">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-teal-700">
                    Step {currentStep + 1} of {STEPS.length}
                </span>
                <span className="text-sm text-slate-500">{STEPS[currentStep].label}</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                        width: `${((currentStep + 1) / STEPS.length) * 100}%`,
                        background: 'linear-gradient(90deg, #0d9488, #10b981)',
                    }}
                />
            </div>
        </div>
    </div>
)

// ── ATS Tips Panel ───────────────────────────────────────────
const ATSTips = ({ domain }) => {
    const keywords = ATS_KEYWORDS[domain] || ATS_KEYWORDS['General']

    return (
        <Card className="p-5 border-amber-200/60 bg-gradient-to-br from-amber-50/80 to-orange-50/50 mt-6">
            <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-100 rounded-lg shrink-0">
                    <Lightbulb size={20} className="text-amber-600" />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-amber-800">ATS Optimization Tips</h4>
                    <p className="text-xs text-amber-700 mt-1">
                        Include these high-impact keywords to pass Applicant Tracking Systems:
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                        {keywords.map((kw) => (
                            <Badge
                                key={kw}
                                variant="outline"
                                className="text-xs border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 cursor-default transition-colors"
                            >
                                {kw}
                            </Badge>
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    )
}

// ── Field Components ─────────────────────────────────────────
const FormField = ({ label, children, hint }) => (
    <div>
        <Label>{label}</Label>
        {children}
        {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
)

const TextArea = ({ className = '', ...props }) => (
    <textarea
        className={`flex min-h-[80px] w-full rounded-lg px-3 py-2 text-sm placeholder:text-slate-400 input-ring resize-none ${className}`}
        style={{ background: 'var(--surface-card)', color: 'var(--text-primary)' }}
        {...props}
    />
)

// ── Step Components ─────────────────────────────────────────
// Step 1: Personal Info
const PersonalInfoStep = ({ data, onChange }) => (
    <div className="space-y-5">
        <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-teal-100 text-teal-600 rounded-xl">
                <User size={24} />
            </div>
            <div>
                <h3 className="text-lg font-bold text-slate-800">Personal Information</h3>
                <p className="text-sm text-slate-500">Your contact details form the header of your resume</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField label="Full Name *" hint="Use your professional name">
                <Input
                    placeholder="e.g. Punya Surana"
                    value={data.fullName}
                    onChange={(e) => onChange('fullName', e.target.value)}
                />
            </FormField>

            <FormField label="Email Address *">
                <Input
                    type="email"
                    placeholder="e.g. punya@example.com"
                    value={data.email}
                    onChange={(e) => onChange('email', e.target.value)}
                />
            </FormField>

            <FormField label="Phone Number *">
                <Input
                    placeholder="e.g. +91 98765 43210"
                    value={data.phone}
                    onChange={(e) => onChange('phone', e.target.value)}
                />
            </FormField>

            <FormField label="Location">
                <Input
                    placeholder="e.g. Mumbai, India"
                    value={data.location}
                    onChange={(e) => onChange('location', e.target.value)}
                />
            </FormField>

            <FormField label="LinkedIn Profile">
                <Input
                    placeholder="e.g. linkedin.com/in/username"
                    value={data.linkedin}
                    onChange={(e) => onChange('linkedin', e.target.value)}
                />
            </FormField>

            <FormField label="GitHub Profile">
                <Input
                    placeholder="e.g. github.com/username"
                    value={data.github}
                    onChange={(e) => onChange('github', e.target.value)}
                />
            </FormField>

            <FormField label="Portfolio / Website">
                <Input
                    placeholder="e.g. myportfolio.dev"
                    value={data.portfolio}
                    onChange={(e) => onChange('portfolio', e.target.value)}
                />
            </FormField>
        </div>

        <FormField label="Professional Summary *" hint="2-3 sentences. Use keywords like 'results-driven', 'proven track record', 'proficient in...'">
            <TextArea
                rows={4}
                placeholder="Results-driven Computer Science graduate with hands-on experience in full-stack development. Proficient in React, Node.js, and cloud technologies. Passionate about building scalable solutions and delivering measurable impact..."
                value={data.summary}
                onChange={(e) => onChange('summary', e.target.value)}
            />
        </FormField>
    </div>
)

// Step 2: Education
const EducationStep = ({ data, onChange, onAdd, onRemove }) => (
    <div className="space-y-5">
        <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                <GraduationCap size={24} />
            </div>
            <div>
                <h3 className="text-lg font-bold text-slate-800">Education</h3>
                <p className="text-sm text-slate-500">Add your academic background — most recent first</p>
            </div>
        </div>

        {data.map((edu, idx) => (
            <Card key={idx} className="p-5 border-blue-100 bg-blue-50/20 relative">
                {data.length > 1 && (
                    <button
                        onClick={() => onRemove(idx)}
                        className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"
                    >
                        <Trash2 size={16} />
                    </button>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Institution Name *">
                        <Input
                            placeholder="e.g. IIT Delhi"
                            value={edu.institution}
                            onChange={(e) => onChange(idx, 'institution', e.target.value)}
                        />
                    </FormField>
                    <FormField label="Degree *">
                        <Input
                            placeholder="e.g. B.Tech"
                            value={edu.degree}
                            onChange={(e) => onChange(idx, 'degree', e.target.value)}
                        />
                    </FormField>
                    <FormField label="Field of Study *">
                        <Input
                            placeholder="e.g. Computer Science & Engineering"
                            value={edu.field}
                            onChange={(e) => onChange(idx, 'field', e.target.value)}
                        />
                    </FormField>
                    <FormField label="CGPA / Percentage">
                        <Input
                            placeholder="e.g. 8.5 / 10"
                            value={edu.cgpa}
                            onChange={(e) => onChange(idx, 'cgpa', e.target.value)}
                        />
                    </FormField>
                    <FormField label="Start Year">
                        <Input
                            placeholder="e.g. 2020"
                            value={edu.startYear}
                            onChange={(e) => onChange(idx, 'startYear', e.target.value)}
                        />
                    </FormField>
                    <FormField label="End Year">
                        <Input
                            placeholder="e.g. 2024"
                            value={edu.endYear}
                            onChange={(e) => onChange(idx, 'endYear', e.target.value)}
                        />
                    </FormField>
                    <div className="md:col-span-2">
                        <FormField label="Relevant Coursework" hint="Comma-separated. Helps ATS match your courses to job requirements">
                            <Input
                                placeholder="e.g. Data Structures, Algorithms, Operating Systems, DBMS, Machine Learning"
                                value={edu.relevantCourses}
                                onChange={(e) => onChange(idx, 'relevantCourses', e.target.value)}
                            />
                        </FormField>
                    </div>
                </div>
            </Card>
        ))}

        <Button variant="ghost" onClick={onAdd} className="gap-2 text-blue-600 hover:text-blue-700">
            <Plus size={16} /> Add Another Education
        </Button>
    </div>
)

// Step 3: Experience
const ExperienceStep = ({ data, onChange, onAdd, onRemove }) => (
    <div className="space-y-5">
        <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                <Briefcase size={24} />
            </div>
            <div>
                <h3 className="text-lg font-bold text-slate-800">Work Experience</h3>
                <p className="text-sm text-slate-500">Include internships, freelance work, or part-time roles</p>
            </div>
        </div>

        {data.map((exp, idx) => (
            <Card key={idx} className="p-5 border-purple-100 bg-purple-50/20 relative">
                {data.length > 1 && (
                    <button
                        onClick={() => onRemove(idx)}
                        className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"
                    >
                        <Trash2 size={16} />
                    </button>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Company / Organization *">
                        <Input
                            placeholder="e.g. Google"
                            value={exp.company}
                            onChange={(e) => onChange(idx, 'company', e.target.value)}
                        />
                    </FormField>
                    <FormField label="Role / Title *">
                        <Input
                            placeholder="e.g. Software Engineering Intern"
                            value={exp.role}
                            onChange={(e) => onChange(idx, 'role', e.target.value)}
                        />
                    </FormField>
                    <FormField label="Start Date">
                        <Input
                            type="month"
                            value={exp.startDate}
                            onChange={(e) => onChange(idx, 'startDate', e.target.value)}
                        />
                    </FormField>
                    <div>
                        <FormField label="End Date">
                            <Input
                                type="month"
                                value={exp.endDate}
                                disabled={exp.current}
                                onChange={(e) => onChange(idx, 'endDate', e.target.value)}
                            />
                        </FormField>
                        <label className="flex items-center gap-2 mt-2 text-sm text-slate-600 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={exp.current}
                                onChange={(e) => onChange(idx, 'current', e.target.checked)}
                                className="rounded accent-teal-600"
                            />
                            Currently working here
                        </label>
                    </div>
                    <div className="md:col-span-2">
                        <FormField label="Description" hint="Use action verbs: Developed, Implemented, Optimized, Led, Designed...">
                            <TextArea
                                rows={3}
                                placeholder="Developed REST APIs using Node.js that improved response time by 40%. Collaborated with cross-functional teams to deliver features on schedule..."
                                value={exp.description}
                                onChange={(e) => onChange(idx, 'description', e.target.value)}
                            />
                        </FormField>
                    </div>
                    <div className="md:col-span-2">
                        <FormField label="Key Achievements" hint="Quantify results: 'Reduced load time by 30%', 'Handled 10K+ daily users'">
                            <TextArea
                                rows={2}
                                placeholder="• Reduced API response time by 40%&#10;• Automated deployment pipeline saving 5 hours/week"
                                value={exp.achievements}
                                onChange={(e) => onChange(idx, 'achievements', e.target.value)}
                            />
                        </FormField>
                    </div>
                </div>
            </Card>
        ))}

        <Button variant="ghost" onClick={onAdd} className="gap-2 text-purple-600 hover:text-purple-700">
            <Plus size={16} /> Add Another Experience
        </Button>
    </div>
)

// Step 4: Skills
const SkillsStep = ({ data, onChange }) => (
    <div className="space-y-5">
        <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-cyan-100 text-cyan-600 rounded-xl">
                <Code2 size={24} />
            </div>
            <div>
                <h3 className="text-lg font-bold text-slate-800">Technical & Soft Skills</h3>
                <p className="text-sm text-slate-500">ATS scans for exact keyword matches — be specific</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField label="Programming Languages *" hint="e.g. JavaScript, Python, Java, C++">
                <Input
                    placeholder="JavaScript, Python, Java, C++"
                    value={data.languages}
                    onChange={(e) => onChange('languages', e.target.value)}
                />
            </FormField>

            <FormField label="Frameworks & Libraries *" hint="e.g. React, Node.js, Express, Django">
                <Input
                    placeholder="React, Node.js, Express, Django, TensorFlow"
                    value={data.frameworks}
                    onChange={(e) => onChange('frameworks', e.target.value)}
                />
            </FormField>

            <FormField label="Tools & Platforms" hint="e.g. Git, Docker, AWS, VS Code">
                <Input
                    placeholder="Git, Docker, AWS, PostgreSQL, MongoDB"
                    value={data.tools}
                    onChange={(e) => onChange('tools', e.target.value)}
                />
            </FormField>

            <FormField label="Technical Skills" hint="e.g. REST APIs, CI/CD, Agile">
                <Input
                    placeholder="REST APIs, CI/CD, Agile, Microservices, TDD"
                    value={data.technical}
                    onChange={(e) => onChange('technical', e.target.value)}
                />
            </FormField>

            <div className="md:col-span-2">
                <FormField label="Soft Skills" hint="e.g. Leadership, Communication, Problem-solving">
                    <Input
                        placeholder="Leadership, Communication, Team Collaboration, Problem-solving, Time Management"
                        value={data.soft}
                        onChange={(e) => onChange('soft', e.target.value)}
                    />
                </FormField>
            </div>
        </div>

        <div className="mt-4">
            <Label className="text-sm font-semibold">Target Domain</Label>
            <p className="text-xs text-slate-400 mb-2">Select your target domain for tailored ATS keyword suggestions</p>
            <div className="flex flex-wrap gap-2">
                {Object.keys(ATS_KEYWORDS).map((domain) => (
                    <button
                        key={domain}
                        onClick={() => onChange('domain', domain)}
                        className={`
              px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200
              ${data.domain === domain
                                ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300 hover:text-teal-600'
                            }
            `}
                    >
                        {domain}
                    </button>
                ))}
            </div>
        </div>

        <ATSTips domain={data.domain} />
    </div>
)

// Step 5: Projects
const ProjectsStep = ({ data, onChange, onAdd, onRemove }) => (
    <div className="space-y-5">
        <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                <Target size={24} />
            </div>
            <div>
                <h3 className="text-lg font-bold text-slate-800">Projects</h3>
                <p className="text-sm text-slate-500">Showcase 2-3 impactful projects with quantifiable results</p>
            </div>
        </div>

        {data.map((proj, idx) => (
            <Card key={idx} className="p-5 border-indigo-100 bg-indigo-50/20 relative">
                {data.length > 1 && (
                    <button
                        onClick={() => onRemove(idx)}
                        className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"
                    >
                        <Trash2 size={16} />
                    </button>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Project Name *">
                        <Input
                            placeholder="e.g. Campus Placement Management System"
                            value={proj.name}
                            onChange={(e) => onChange(idx, 'name', e.target.value)}
                        />
                    </FormField>
                    <FormField label="Tech Stack">
                        <Input
                            placeholder="e.g. React, Node.js, MongoDB, Socket.io"
                            value={proj.techStack}
                            onChange={(e) => onChange(idx, 'techStack', e.target.value)}
                        />
                    </FormField>
                    <div className="md:col-span-2">
                        <FormField label="Description *" hint="Start with action verbs. Quantify impact where possible">
                            <TextArea
                                rows={3}
                                placeholder="Engineered a full-stack placement portal serving 500+ students, featuring real-time notifications, automated drive scheduling, and analytics dashboards. Reduced manual placement coordination effort by 60%..."
                                value={proj.description}
                                onChange={(e) => onChange(idx, 'description', e.target.value)}
                            />
                        </FormField>
                    </div>
                    <FormField label="Live Link / Repository">
                        <Input
                            placeholder="e.g. github.com/user/project"
                            value={proj.link}
                            onChange={(e) => onChange(idx, 'link', e.target.value)}
                        />
                    </FormField>
                </div>
            </Card>
        ))}

        <Button variant="ghost" onClick={onAdd} className="gap-2 text-indigo-600 hover:text-indigo-700">
            <Plus size={16} /> Add Another Project
        </Button>
    </div>
)

// Step 6: Certifications
const CertificationsStep = ({ data, onChange, onAdd, onRemove }) => (
    <div className="space-y-5">
        <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                <Award size={24} />
            </div>
            <div>
                <h3 className="text-lg font-bold text-slate-800">Certifications & Achievements</h3>
                <p className="text-sm text-slate-500">Industry certifications and notable achievements boost ATS score</p>
            </div>
        </div>

        {data.map((cert, idx) => (
            <Card key={idx} className="p-5 border-amber-100 bg-amber-50/20 relative">
                {data.length > 1 && (
                    <button
                        onClick={() => onRemove(idx)}
                        className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"
                    >
                        <Trash2 size={16} />
                    </button>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Certification Name *">
                        <Input
                            placeholder="e.g. AWS Solutions Architect Associate"
                            value={cert.name}
                            onChange={(e) => onChange(idx, 'name', e.target.value)}
                        />
                    </FormField>
                    <FormField label="Issuing Organization">
                        <Input
                            placeholder="e.g. Amazon Web Services"
                            value={cert.issuer}
                            onChange={(e) => onChange(idx, 'issuer', e.target.value)}
                        />
                    </FormField>
                    <FormField label="Date Obtained">
                        <Input
                            type="month"
                            value={cert.date}
                            onChange={(e) => onChange(idx, 'date', e.target.value)}
                        />
                    </FormField>
                    <FormField label="Credential ID">
                        <Input
                            placeholder="e.g. CERT-12345-ABC"
                            value={cert.credentialId}
                            onChange={(e) => onChange(idx, 'credentialId', e.target.value)}
                        />
                    </FormField>
                </div>
            </Card>
        ))}

        <Button variant="ghost" onClick={onAdd} className="gap-2 text-amber-600 hover:text-amber-700">
            <Plus size={16} /> Add Another Certification
        </Button>
    </div>
)

// ── Preview Step ─────────────────────────────────────────────
const PreviewStep = ({ formData }) => {
    const { personal, education, experience, skills, projects, certifications } = formData

    return (
        <div className="space-y-5">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                    <Download size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Preview & Download</h3>
                    <p className="text-sm text-slate-500">Review your resume before generating the PDF</p>
                </div>
            </div>

            {/* ATS Score Indicator */}
            <Card className="p-5 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50/50">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-100 rounded-xl">
                        <Zap size={24} className="text-emerald-600" />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-emerald-800">ATS Compatibility Check</h4>
                        <p className="text-sm text-emerald-700 mt-1">
                            {getATSScore(formData) >= 80
                                ? '✅ Your resume is well-optimized for ATS systems!'
                                : getATSScore(formData) >= 50
                                    ? '⚠️ Good start! Add more details to improve your ATS score.'
                                    : '🔴 Consider filling in more sections for better ATS compatibility.'}
                        </p>
                    </div>
                    <div className="text-right">
                        <span className="text-3xl font-bold text-emerald-700">{getATSScore(formData)}%</span>
                        <p className="text-xs text-emerald-600 font-medium">ATS Score</p>
                    </div>
                </div>
            </Card>

            {/* Resume Preview */}
            <Card className="p-6 md:p-8 bg-white border-slate-200">
                {/* Header */}
                <div className="border-b-2 border-slate-800 pb-4 mb-5">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{personal.fullName || 'Your Name'}</h2>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-slate-600">
                        {personal.email && <span>{personal.email}</span>}
                        {personal.phone && <span>• {personal.phone}</span>}
                        {personal.location && <span>• {personal.location}</span>}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-teal-600">
                        {personal.linkedin && <span>{personal.linkedin}</span>}
                        {personal.github && <span>• {personal.github}</span>}
                        {personal.portfolio && <span>• {personal.portfolio}</span>}
                    </div>
                </div>

                {/* Summary */}
                {personal.summary && (
                    <div className="mb-5">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Professional Summary</h3>
                        <p className="text-sm text-slate-600 leading-relaxed">{personal.summary}</p>
                    </div>
                )}

                {/* Education */}
                {education.some((e) => e.institution) && (
                    <div className="mb-5">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 border-b border-slate-200 pb-1">Education</h3>
                        {education
                            .filter((e) => e.institution)
                            .map((edu, idx) => (
                                <div key={idx} className="mb-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-sm text-slate-800">{edu.degree} in {edu.field}</p>
                                            <p className="text-sm text-slate-600">{edu.institution}</p>
                                        </div>
                                        <span className="text-xs text-slate-500 shrink-0">
                                            {edu.startYear} – {edu.endYear}
                                        </span>
                                    </div>
                                    {edu.cgpa && <p className="text-xs text-slate-500 mt-1">CGPA: {edu.cgpa}</p>}
                                    {edu.relevantCourses && (
                                        <p className="text-xs text-slate-500 mt-1">
                                            <span className="font-medium">Courses:</span> {edu.relevantCourses}
                                        </p>
                                    )}
                                </div>
                            ))}
                    </div>
                )}

                {/* Experience */}
                {experience.some((e) => e.company) && (
                    <div className="mb-5">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 border-b border-slate-200 pb-1">Experience</h3>
                        {experience
                            .filter((e) => e.company)
                            .map((exp, idx) => (
                                <div key={idx} className="mb-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-sm text-slate-800">{exp.role}</p>
                                            <p className="text-sm text-slate-600">{exp.company}</p>
                                        </div>
                                        <span className="text-xs text-slate-500 shrink-0">
                                            {formatMonthYear(exp.startDate)} – {exp.current ? 'Present' : formatMonthYear(exp.endDate)}
                                        </span>
                                    </div>
                                    {exp.description && <p className="text-xs text-slate-600 mt-1 leading-relaxed">{exp.description}</p>}
                                    {exp.achievements && <p className="text-xs text-slate-600 mt-1 leading-relaxed">{exp.achievements}</p>}
                                </div>
                            ))}
                    </div>
                )}

                {/* Skills */}
                {(skills.languages || skills.frameworks || skills.tools || skills.technical || skills.soft) && (
                    <div className="mb-5">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 border-b border-slate-200 pb-1">Skills</h3>
                        <div className="space-y-1.5 text-sm text-slate-600">
                            {skills.languages && <p><span className="font-medium text-slate-700">Languages:</span> {skills.languages}</p>}
                            {skills.frameworks && <p><span className="font-medium text-slate-700">Frameworks:</span> {skills.frameworks}</p>}
                            {skills.tools && <p><span className="font-medium text-slate-700">Tools:</span> {skills.tools}</p>}
                            {skills.technical && <p><span className="font-medium text-slate-700">Technical:</span> {skills.technical}</p>}
                            {skills.soft && <p><span className="font-medium text-slate-700">Soft Skills:</span> {skills.soft}</p>}
                        </div>
                    </div>
                )}

                {/* Projects */}
                {projects.some((p) => p.name) && (
                    <div className="mb-5">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 border-b border-slate-200 pb-1">Projects</h3>
                        {projects
                            .filter((p) => p.name)
                            .map((proj, idx) => (
                                <div key={idx} className="mb-3">
                                    <div className="flex justify-between items-start">
                                        <p className="font-bold text-sm text-slate-800">{proj.name}</p>
                                        {proj.link && <span className="text-xs text-teal-600 shrink-0">{proj.link}</span>}
                                    </div>
                                    {proj.techStack && <p className="text-xs text-slate-500 mt-0.5">Tech: {proj.techStack}</p>}
                                    {proj.description && <p className="text-xs text-slate-600 mt-1 leading-relaxed">{proj.description}</p>}
                                </div>
                            ))}
                    </div>
                )}

                {/* Certifications */}
                {certifications.some((c) => c.name) && (
                    <div className="mb-2">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 border-b border-slate-200 pb-1">Certifications</h3>
                        {certifications
                            .filter((c) => c.name)
                            .map((cert, idx) => (
                                <div key={idx} className="mb-2 flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-sm text-slate-800">{cert.name}</p>
                                        {cert.issuer && <p className="text-xs text-slate-500">{cert.issuer}</p>}
                                    </div>
                                    <span className="text-xs text-slate-500 shrink-0">
                                        {formatMonthYear(cert.date)}
                                        {cert.credentialId && ` • ${cert.credentialId}`}
                                    </span>
                                </div>
                            ))}
                    </div>
                )}
            </Card>
        </div>
    )
}

// ── Helpers ──────────────────────────────────────────────────
const formatMonthYear = (dateStr) => {
    if (!dateStr) return ''
    const [year, month] = dateStr.split('-')
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${months[parseInt(month, 10) - 1] || ''} ${year}`
}

const getATSScore = (formData) => {
    let score = 0
    const { personal, education, experience, skills, projects, certifications } = formData

    // Personal info scoring
    if (personal.fullName) score += 8
    if (personal.email) score += 8
    if (personal.phone) score += 5
    if (personal.summary && personal.summary.length > 50) score += 12
    if (personal.linkedin) score += 4
    if (personal.github) score += 3

    // Education
    if (education.some((e) => e.institution && e.degree)) score += 15

    // Experience
    if (experience.some((e) => e.company && e.role)) score += 15
    if (experience.some((e) => e.achievements)) score += 5

    // Skills
    if (skills.languages) score += 8
    if (skills.frameworks) score += 5
    if (skills.tools) score += 3
    if (skills.technical) score += 4

    // Projects
    if (projects.some((p) => p.name && p.description)) score += 5

    // Certifications
    if (certifications.some((c) => c.name)) score += 5

    return Math.min(score, 100)
}

// ── PDF Generation ──────────────────────────────────────────
const generatePDF = (formData) => {
    const { personal, education, experience, skills, projects, certifications } = formData

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

    const pageW = 210
    const marginL = 15
    const marginR = 15
    const contentW = pageW - marginL - marginR
    let y = 15

    const checkPageBreak = (needed = 20) => {
        if (y + needed > 280) {
            doc.addPage()
            y = 15
        }
    }

    // ── Section helper ──────────────────────
    const drawSectionHeader = (title) => {
        checkPageBreak(15)
        y += 3
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(10)
        doc.setTextColor(30, 41, 59)
        doc.text(title.toUpperCase(), marginL, y)
        y += 1.5
        doc.setDrawColor(30, 41, 59)
        doc.setLineWidth(0.5)
        doc.line(marginL, y, pageW - marginR, y)
        y += 5
    }

    // ── Header ──────────────────────────────
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.setTextColor(15, 23, 42)
    doc.text(personal.fullName || 'Your Name', pageW / 2, y, { align: 'center' })
    y += 7

    // Contact row
    const contactParts = [personal.email, personal.phone, personal.location].filter(Boolean)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(71, 85, 105)
    if (contactParts.length) {
        doc.text(contactParts.join('  |  '), pageW / 2, y, { align: 'center' })
        y += 4.5
    }

    // Links row
    const linkParts = [personal.linkedin, personal.github, personal.portfolio].filter(Boolean)
    if (linkParts.length) {
        doc.setTextColor(13, 148, 136)
        doc.text(linkParts.join('  |  '), pageW / 2, y, { align: 'center' })
        y += 4.5
    }

    doc.setTextColor(71, 85, 105) // reset text color

    // ── Summary ─────────────────────────────
    if (personal.summary) {
        drawSectionHeader('Professional Summary')
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.setTextColor(71, 85, 105)
        const summaryLines = doc.splitTextToSize(personal.summary, contentW)
        checkPageBreak(summaryLines.length * 4 + 5)
        doc.text(summaryLines, marginL, y)
        y += summaryLines.length * 4 + 3
    }

    // ── Education ───────────────────────────
    const validEdu = education.filter((e) => e.institution)
    if (validEdu.length) {
        drawSectionHeader('Education')
        validEdu.forEach((edu) => {
            checkPageBreak(18)
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(10)
            doc.setTextColor(30, 41, 59)

            const degreeText = `${edu.degree}${edu.field ? ` in ${edu.field}` : ''}`
            doc.text(degreeText, marginL, y)

            const dateRange = `${edu.startYear} – ${edu.endYear}`
            doc.setFont('helvetica', 'normal')
            doc.setFontSize(9)
            doc.setTextColor(100, 116, 139)
            doc.text(dateRange, pageW - marginR, y, { align: 'right' })
            y += 4.5

            doc.setFont('helvetica', 'normal')
            doc.setFontSize(9)
            doc.setTextColor(71, 85, 105)
            doc.text(edu.institution, marginL, y)
            if (edu.cgpa) {
                doc.text(`CGPA: ${edu.cgpa}`, pageW - marginR, y, { align: 'right' })
            }
            y += 4.5

            if (edu.relevantCourses) {
                doc.setFont('helvetica', 'italic')
                doc.setFontSize(8.5)
                const courseLines = doc.splitTextToSize(`Relevant Courses: ${edu.relevantCourses}`, contentW)
                checkPageBreak(courseLines.length * 3.5 + 2)
                doc.text(courseLines, marginL, y)
                y += courseLines.length * 3.5 + 2
            }
            y += 2
        })
    }

    // ── Experience ──────────────────────────
    const validExp = experience.filter((e) => e.company)
    if (validExp.length) {
        drawSectionHeader('Experience')
        validExp.forEach((exp) => {
            checkPageBreak(20)
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(10)
            doc.setTextColor(30, 41, 59)
            doc.text(exp.role || 'Role', marginL, y)

            const dates = `${formatMonthYear(exp.startDate)} – ${exp.current ? 'Present' : formatMonthYear(exp.endDate)}`
            doc.setFont('helvetica', 'normal')
            doc.setFontSize(9)
            doc.setTextColor(100, 116, 139)
            doc.text(dates, pageW - marginR, y, { align: 'right' })
            y += 4.5

            doc.setFont('helvetica', 'normal')
            doc.setFontSize(9)
            doc.setTextColor(71, 85, 105)
            doc.text(exp.company, marginL, y)
            y += 4.5

            if (exp.description) {
                const bulletLines = exp.description.split('\n').filter(Boolean)
                bulletLines.forEach((line) => {
                    checkPageBreak(6)
                    const text = line.startsWith('•') ? line : `• ${line}`
                    const wrapped = doc.splitTextToSize(text, contentW - 3)
                    doc.text(wrapped, marginL + 2, y)
                    y += wrapped.length * 3.8
                })
                y += 1
            }

            if (exp.achievements) {
                const achLines = exp.achievements.split('\n').filter(Boolean)
                achLines.forEach((line) => {
                    checkPageBreak(6)
                    const text = line.startsWith('•') ? line : `• ${line}`
                    const wrapped = doc.splitTextToSize(text, contentW - 3)
                    doc.text(wrapped, marginL + 2, y)
                    y += wrapped.length * 3.8
                })
            }
            y += 3
        })
    }

    // ── Skills ──────────────────────────────
    if (skills.languages || skills.frameworks || skills.tools || skills.technical || skills.soft) {
        drawSectionHeader('Skills')
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)

        const skillEntries = [
            { label: 'Programming Languages', value: skills.languages },
            { label: 'Frameworks & Libraries', value: skills.frameworks },
            { label: 'Tools & Platforms', value: skills.tools },
            { label: 'Technical Skills', value: skills.technical },
            { label: 'Soft Skills', value: skills.soft },
        ]

        skillEntries.forEach(({ label, value }) => {
            if (value) {
                checkPageBreak(6)
                doc.setFont('helvetica', 'bold')
                doc.setFontSize(9)
                doc.setTextColor(30, 41, 59)
                doc.text(`${label}: `, marginL, y)
                const labelWidth = doc.getTextWidth(`${label}: `)
                doc.setFont('helvetica', 'normal')
                doc.setTextColor(71, 85, 105)
                const skillWrap = doc.splitTextToSize(value, contentW - labelWidth)
                doc.text(skillWrap[0], marginL + labelWidth, y)
                if (skillWrap.length > 1) {
                    for (let i = 1; i < skillWrap.length; i++) {
                        y += 3.8
                        checkPageBreak(5)
                        doc.text(skillWrap[i], marginL + labelWidth, y)
                    }
                }
                y += 4.5
            }
        })
    }

    // ── Projects ────────────────────────────
    const validProj = projects.filter((p) => p.name)
    if (validProj.length) {
        drawSectionHeader('Projects')
        validProj.forEach((proj) => {
            checkPageBreak(15)
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(10)
            doc.setTextColor(30, 41, 59)
            doc.text(proj.name, marginL, y)

            if (proj.link) {
                doc.setFont('helvetica', 'normal')
                doc.setFontSize(8.5)
                doc.setTextColor(13, 148, 136)
                doc.text(proj.link, pageW - marginR, y, { align: 'right' })
            }
            y += 4.5

            if (proj.techStack) {
                doc.setFont('helvetica', 'italic')
                doc.setFontSize(8.5)
                doc.setTextColor(100, 116, 139)
                doc.text(`Tech Stack: ${proj.techStack}`, marginL, y)
                y += 4
            }

            if (proj.description) {
                doc.setFont('helvetica', 'normal')
                doc.setFontSize(9)
                doc.setTextColor(71, 85, 105)
                const descLines = doc.splitTextToSize(proj.description, contentW)
                checkPageBreak(descLines.length * 3.8 + 3)
                doc.text(descLines, marginL, y)
                y += descLines.length * 3.8 + 2
            }
            y += 2
        })
    }

    // ── Certifications ─────────────────────
    const validCert = certifications.filter((c) => c.name)
    if (validCert.length) {
        drawSectionHeader('Certifications')
        validCert.forEach((cert) => {
            checkPageBreak(10)
            doc.setFont('helvetica', 'bold')
            doc.setFontSize(9)
            doc.setTextColor(30, 41, 59)
            doc.text(cert.name, marginL, y)

            const certMeta = [formatMonthYear(cert.date), cert.credentialId].filter(Boolean).join(' • ')
            if (certMeta) {
                doc.setFont('helvetica', 'normal')
                doc.setFontSize(8.5)
                doc.setTextColor(100, 116, 139)
                doc.text(certMeta, pageW - marginR, y, { align: 'right' })
            }
            y += 4

            if (cert.issuer) {
                doc.setFont('helvetica', 'normal')
                doc.setFontSize(8.5)
                doc.setTextColor(71, 85, 105)
                doc.text(cert.issuer, marginL, y)
                y += 4.5
            }
        })
    }

    // Save PDF
    const fileName = `${(personal.fullName || 'resume').replace(/\s+/g, '_')}_Resume.pdf`
    doc.save(fileName)
    return fileName
}

// ── Main ResumeBuilder Component ─────────────────────────────
const ResumeBuilder = () => {
    const [step, setStep] = useState(0)
    const [formData, setFormData] = useState(initialState)
    const [isGenerating, setIsGenerating] = useState(false)

    // ── Update handlers per step type ──────
    const updatePersonal = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            personal: { ...prev.personal, [field]: value },
        }))
    }

    const updateArrayField = (section, idx, field, value) => {
        setFormData((prev) => ({
            ...prev,
            [section]: prev[section].map((item, i) =>
                i === idx ? { ...item, [field]: value } : item
            ),
        }))
    }

    const addArrayItem = (section, template) => {
        setFormData((prev) => ({
            ...prev,
            [section]: [...prev[section], { ...template }],
        }))
    }

    const removeArrayItem = (section, idx) => {
        setFormData((prev) => ({
            ...prev,
            [section]: prev[section].filter((_, i) => i !== idx),
        }))
    }

    const updateSkills = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            skills: { ...prev.skills, [field]: value },
        }))
    }

    // ── Navigation ─────────────────────────
    const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1))
    const prev = () => setStep((s) => Math.max(s - 1, 0))

    // ── Download handler ──────────────────
    const handleDownload = () => {
        setIsGenerating(true)
        try {
            generatePDF(formData)
        } finally {
            setTimeout(() => setIsGenerating(false), 1000)
        }
    }

    // ── Render current step ────────────────
    const renderStep = () => {
        switch (step) {
            case 0:
                return <PersonalInfoStep data={formData.personal} onChange={updatePersonal} />
            case 1:
                return (
                    <EducationStep
                        data={formData.education}
                        onChange={(idx, field, val) => updateArrayField('education', idx, field, val)}
                        onAdd={() => addArrayItem('education', initialState.education[0])}
                        onRemove={(idx) => removeArrayItem('education', idx)}
                    />
                )
            case 2:
                return (
                    <ExperienceStep
                        data={formData.experience}
                        onChange={(idx, field, val) => updateArrayField('experience', idx, field, val)}
                        onAdd={() => addArrayItem('experience', initialState.experience[0])}
                        onRemove={(idx) => removeArrayItem('experience', idx)}
                    />
                )
            case 3:
                return <SkillsStep data={formData.skills} onChange={updateSkills} />
            case 4:
                return (
                    <ProjectsStep
                        data={formData.projects}
                        onChange={(idx, field, val) => updateArrayField('projects', idx, field, val)}
                        onAdd={() => addArrayItem('projects', initialState.projects[0])}
                        onRemove={(idx) => removeArrayItem('projects', idx)}
                    />
                )
            case 5:
                return (
                    <CertificationsStep
                        data={formData.certifications}
                        onChange={(idx, field, val) => updateArrayField('certifications', idx, field, val)}
                        onAdd={() => addArrayItem('certifications', initialState.certifications[0])}
                        onRemove={(idx) => removeArrayItem('certifications', idx)}
                    />
                )
            case 6:
                return <PreviewStep formData={formData} />
            default:
                return null
        }
    }

    return (
        <Card className="overflow-hidden">
            {/* Header */}
            <div className="p-6 md:p-8 border-b border-slate-100 bg-gradient-to-r from-teal-50/80 via-emerald-50/50 to-cyan-50/30">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-teal-500 to-emerald-600 text-white rounded-xl shadow-lg shadow-teal-500/20">
                        <Sparkles size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            ATS Resume Builder
                            <Badge variant="outline" className="text-xs border-teal-300 text-teal-700 bg-teal-50">
                                ATS Verified
                            </Badge>
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Build a professional, ATS-optimized resume tailored for campus placements
                        </p>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="p-6 md:p-8">
                <StepperBar currentStep={step} setStep={setStep} />

                <div className="min-h-[400px]">{renderStep()}</div>

                {/* Footer Navigation */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
                    <Button
                        variant="ghost"
                        onClick={prev}
                        disabled={step === 0}
                        className="gap-2"
                    >
                        <ChevronLeft size={16} /> Previous
                    </Button>

                    <div className="flex items-center gap-3">
                        {step === STEPS.length - 1 ? (
                            <Button
                                onClick={handleDownload}
                                disabled={isGenerating}
                                className="gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-lg shadow-teal-500/20 px-6"
                            >
                                {isGenerating ? (
                                    <>
                                        <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Download size={16} /> Download PDF Resume
                                    </>
                                )}
                            </Button>
                        ) : (
                            <Button onClick={next} className="gap-2">
                                Next <ChevronRight size={16} />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    )
}

export default ResumeBuilder
