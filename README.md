# AI Interview Assistant 🚀

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-blue)
![Supabase](https://img.shields.io/badge/Supabase-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-blue)
![OpenRouter](https://img.shields.io/badge/LLM-OpenRouter-purple)
![Vercel](https://img.shields.io/badge/Vercel-black)

An AI-powered interview preparation SaaS platform built with Next.js, Supabase, PostgreSQL and Large Language Models.

AI Interview Assistant helps job seekers practice interviews by analyzing resumes, generating personalized interview questions, evaluating answers, and providing AI-powered interview feedback reports.

---

## 🌐 Live Demo

[Coming soon](https://ai-interview-assistant-gamma-eight.vercel.app/)

---

# ✨ Features

## 📄 Resume Analysis

Upload your resume and let AI analyze your background.

The system extracts:

- Technical skills
- Work experience
- Project experience
- Potential interview focus areas


---

## 🤖 AI Interview Question Generation

Generate personalized interview questions based on:

- Resume content
- Technical background
- Target position


Question types include:

- Technical questions
- Project experience questions
- Behavioral questions


---

## 🎯 AI Answer Evaluation

AI evaluates interview answers from multiple dimensions:

- Technical correctness
- Completeness
- Communication ability
- Improvement suggestions


---

## 📊 AI Interview Report

Generate a structured interview report containing:

- Overall score
- Strengths
- Weaknesses
- Improvement suggestions
- Learning recommendations


---

## 🔐 Authentication

Implemented user authentication with Supabase Auth.

Features:

- Google OAuth Login
- User session management
- User identity verification


---

## 📚 Interview History

Users can save and review previous interview sessions.

Features:

- Persistent interview records
- Personal history tracking
- Report review


---

# 🏗️ Architecture


```
                    User

                     |

                     v

              Next.js Application

                     |

        ----------------------------

        |                          |

        v                          v

    Supabase                  LLM API

        |                          |

        v                          v

 PostgreSQL                 AI Analysis

        |

        v

 Interview Reports

```


---

# 🔄 Application Flow


```
Upload Resume

      |

      v

Resume Analysis

      |

      v

Generate Interview Questions

      |

      v

User Answers Questions

      |

      v

AI Evaluation

      |

      v

Generate Interview Report

      |

      v

Save History

```


---

# 🛠️ Tech Stack


## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS


## Backend

- Next.js API Routes
- Supabase


## Database

- PostgreSQL


## Authentication

- Supabase Auth


## AI

- OpenRouter API
- Large Language Models
- Prompt Engineering


## Deployment

- Vercel


---

# 📂 Project Structure


```
src
│
├── app
│   │
│   ├── api
│   │   ├── analyze
│   │   └── reports
│   │
│   ├── dashboard
│   │
│   ├── interview
│   │
│   ├── login
│   │
│   └── resume
│
├── components
│
├── lib
│
└── utils

```


---

# 🗄️ Database Design


## interview_reports


| Column | Type | Description |
|---|---|---|
| id | UUID | Primary Key |
| user_id | UUID | User reference |
| report | JSONB | AI generated report |
| created_at | Timestamp | Creation time |


---

# 🔒 Environment Variables


Create `.env.local`:


```env
OPENROUTER_API_KEY=

NEXT_PUBLIC_SUPABASE_URL=

NEXT_PUBLIC_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=
```


Never expose sensitive keys in your source code.


---

# 💡 Engineering Highlights


## AI Output Structuring

Instead of returning plain text, AI responses are designed with structured formats.

Benefits:

- Reliable parsing
- Stable frontend rendering
- Better user experience


---

## Separation of Concerns

The project separates:

```
UI Layer

↓

Business Logic

↓

Database Layer

↓

External Services

```


This improves:

- Maintainability
- Scalability
- Code reuse


---

## Secure Data Management

Implemented:

- Environment variables
- Authentication
- User-based data isolation


---

# 🚧 Future Improvements


## Streaming AI Response

Provide ChatGPT-like real-time generation experience.


---

## Resume PDF Parsing

Support PDF resume upload and automatic content extraction.


---

## Job Description Matching

Allow users to input target job descriptions.

AI analyzes:

- Resume match rate
- Missing skills
- Improvement suggestions


---

## Advanced Analytics Dashboard

Track:

- Interview score trends
- Common weaknesses
- Improvement progress


---

# 📚 What I Learned


Through this project, I practiced:

- Building AI-powered SaaS applications
- Integrating LLM APIs
- Prompt Engineering
- Next.js full-stack development
- Authentication implementation
- PostgreSQL database design
- Production deployment


---

# 🎯 Project Goals


This project demonstrates the ability to build a complete AI application from idea to production:

```
Frontend

+

Backend API

+

Database

+

Authentication

+

AI Integration

+

Deployment

```

---

# 👨‍💻 Author

Long

GitHub:

https://github.com/alongAox

# 项目截图
dashboard<img width="2559" height="1398" alt="497294e55db5e5fd477c5d2d3dc93d45" src="https://github.com/user-attachments/assets/79d53618-e344-4df6-bc4f-03be2934ad97" />
resume<img width="2559" height="1398" alt="f512ac0a60ce6239b6c76c6a211beca6" src="https://github.com/user-attachments/assets/955337b2-3784-4d6d-bf57-b89c2ea77df6" />
report<img width="2559" height="1398" alt="791bc829f81234f15da32ea797b094cd" src="https://github.com/user-attachments/assets/f2526869-aa5c-4bf7-87b0-e1eade1412b6" />


