# KMRL Smart Document Assistant

A comprehensive, bilingual (English/Malayalam) document management system for Kochi Metro Rail Limited (KMRL) with AI-powered features including OCR, summarization, translation, and intelligent routing.

##Features

### Core Functionality
- **Universal Document Intake**: Email, WhatsApp, SharePoint, direct upload, mobile camera
- **Bilingual OCR**: English and Malayalam text extraction using Google Vision API
- **AI Processing**: Summarization, keyword extraction, bidirectional EN↔ML translation
- **Smart Classification**: Auto-categorization (HR, Safety, Engineering, Regulatory, etc.)
- **Intelligent Routing**: Automatic assignment to relevant departments
- **Audit Trail**: Complete immutable compliance tracking with role-based access

### User Experience
- **Web Dashboard**: Responsive, accessible interface with dark/light mode
- **Mobile App**: PWA with camera integration, offline-first sync
- **Bilingual Support**: Seamless English/Malayalam toggle throughout
- **Voice Interface**: Speech queries in both languages
- **AI Chatbot**: Document Q&A with source citations
- **Knowledge Graph**: Visual exploration of document relationships

### Analytics & Insights
- **Performance Dashboards**: SLA tracking, compliance metrics
- **Visual Analytics**: Document trends, department performance
- **Knowledge Visualization**: Interactive relationship graphs
- **Real-time Monitoring**: Processing status, pending items

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, FastAPI (optional)
- **Database**: PostgreSQL with full-text search
- **Cache**: Redis for sessions and temporary data
- **AI Services**: Google Vision API, Google Translate API
- **Deployment**: Docker, Nginx, SSL/TLS

### System Components
\`\`\`
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Client    │    │  Mobile Client  │    │  External APIs  │
│   (Next.js)     │    │     (PWA)       │    │ (Email/WhatsApp)│
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────┴───────────┐
                    │    Nginx Proxy          │
                    │  (Load Balancer/SSL)    │
                    └─────────────┬───────────┘
                                  │
                    ┌─────────────┴───────────┐
                    │   Next.js Application   │
                    │  (API Routes + UI)      │
                    └─────────────┬───────────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          │                       │                       │
┌─────────┴───────┐    ┌─────────┴───────┐    ┌─────────┴───────┐
│   PostgreSQL    │    │     Redis       │    │  AI Services    │
│   (Documents)   │    │   (Cache)       │    │ (OCR/NLP/ML)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
\`\`\`

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for development)
- Google Cloud API credentials

### Environment Setup
1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd kmrl-document-assistant
\`\`\`

2. Create environment file:
\`\`\`bash
cp .env.example .env
\`\`\`

3. Configure environment variables:
\`\`\`env
# Database
DATABASE_URL=postgresql://kmrl_user:kmrl_password@localhost:5432/kmrl_documents

# Redis
REDIS_URL=redis://localhost:6379

# Authentication
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Google APIs
GOOGLE_VISION_API_KEY=your-google-vision-api-key
GOOGLE_TRANSLATE_API_KEY=your-google-translate-api-key

# Optional: External integrations
WHATSAPP_API_KEY=your-whatsapp-business-api-key
SHAREPOINT_CLIENT_ID=your-sharepoint-client-id
SHAREPOINT_CLIENT_SECRET=your-sharepoint-client-secret
\`\`\`

### Production Deployment
\`\`\`bash
# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f web
\`\`\`

### Development Setup
\`\`\`bash
# Install dependencies
npm install

# Run database migrations
npm run db:migrate

# Seed initial data
npm run db:seed

# Start development server
npm run dev
\`\`\`

## 📱 Mobile App Setup

The mobile app is built as a Progressive Web App (PWA) that can be installed on mobile devices:

1. **Access the app**: Navigate to `https://your-domain.com/mobile`
2. **Install PWA**: Use browser's "Add to Home Screen" option
3. **Camera permissions**: Grant camera access for document capture
4. **Offline sync**: Documents are cached locally and sync when online

## 🔧 Configuration

### Database Schema
The system uses PostgreSQL with the following main tables:
- `users` - User accounts and roles
- `documents` - Document metadata and content
- `departments` - Organizational structure
- `document_routes` - Routing and approval workflows
- `audit_logs` - Complete activity tracking
- `knowledge_graph` - Document relationships

### API Endpoints

#### Document Management
- `POST /api/documents` - Upload document
- `GET /api/documents` - List documents with filters
- `GET /api/documents/[id]` - Get document details
- `PUT /api/documents/[id]` - Update document
- `DELETE /api/documents/[id]` - Delete document

#### AI Services
- `POST /api/ai/ocr` - Extract text from images
- `POST /api/ai/summarize` - Generate document summary
- `POST /api/ai/translate` - Translate text EN↔ML
- `POST /api/ai/classify` - Auto-categorize documents
- `POST /api/ai/chat` - AI chatbot queries
- `POST /api/ai/voice` - Voice query processing

#### Analytics
- `GET /api/analytics` - Dashboard metrics
- `GET /api/ai/knowledge-graph` - Graph data

### Role-Based Access Control

The system supports multiple user roles:
- **Admin**: Full system access, user management
- **Manager**: Department oversight, approval workflows
- **Employee**: Document upload, view assigned documents
- **Viewer**: Read-only access to public documents

## 🎨 Design System

### Color Palette
\`\`\`css
/* Primary Colors */
--primary: #1e40af;        /* KMRL Blue */
--primary-foreground: #ffffff;

/* Secondary Colors */
--secondary: #f1f5f9;      /* Light Gray */
--secondary-foreground: #0f172a;

/* Accent Colors */
--accent: #059669;         /* Success Green */
--destructive: #dc2626;    /* Error Red */
--warning: #d97706;        /* Warning Orange */

/* Neutral Colors */
--background: #ffffff;
--foreground: #0f172a;
--muted: #f8fafc;
--muted-foreground: #64748b;
--border: #e2e8f0;
\`\`\`

### Typography
- **Headings**: Inter (weights: 400, 500, 600, 700)
- **Body**: Inter (weights: 400, 500)
- **Monospace**: JetBrains Mono

### Component Inventory
- **Layout**: DashboardLayout, MobileLayout
- **Navigation**: DashboardSidebar, DashboardHeader
- **Documents**: DocumentCard, DocumentUpload, DocumentViewer
- **AI**: AIChatWidget, VoiceRecorder
- **Analytics**: AnalyticsDashboard, KnowledgeGraph
- **UI**: Button, Card, Input, Select, Badge, Progress

## 🔒 Security

### Authentication & Authorization
- JWT-based authentication with NextAuth.js
- Role-based access control (RBAC)
- Session management with Redis
- API route protection

### Data Security
- All API endpoints require authentication
- Input validation and sanitization
- SQL injection prevention with parameterized queries
- XSS protection with Content Security Policy
- HTTPS enforcement in production

### Compliance
- Complete audit trail for all document operations
- Immutable log entries with timestamps
- Data retention policies
- GDPR compliance features

## 📊 Monitoring & Logging

### Application Monitoring
- Health check endpoints
- Performance metrics
- Error tracking and alerting
- Database query monitoring

### Audit Logging
All user actions are logged with:
- User ID and role
- Action type and timestamp
- Resource affected
- IP address and user agent
- Success/failure status

## 🚀 Deployment Options

### Docker Compose (Recommended)
Complete stack deployment with all services:
\`\`\`bash
docker-compose up -d
\`\`\`

### Kubernetes
For production scale deployment:
\`\`\`bash
kubectl apply -f k8s/
\`\`\`

### Vercel (Frontend Only)
For frontend-only deployment:
\`\`\`bash
vercel deploy
\`\`\`

## 🧪 Testing

### Unit Tests
\`\`\`bash
npm run test
\`\`\`

### Integration Tests
\`\`\`bash
npm run test:integration
\`\`\`

### E2E Tests
\`\`\`bash
npm run test:e2e
\`\`\`

## 📈 Performance

### Optimization Features
- Image optimization with Next.js
- Code splitting and lazy loading
- Redis caching for API responses
- Database query optimization
- CDN integration for static assets

### Monitoring
- Core Web Vitals tracking
- API response time monitoring
- Database performance metrics
- Error rate tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For technical support or questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation wiki

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Core document management
- ✅ Bilingual OCR and translation
- ✅ Web dashboard and mobile PWA
- ✅ Basic AI features

### Phase 2 (Planned)
- [ ] Advanced workflow automation
- [ ] Integration with KMRL systems
- [ ] Enhanced mobile app features
- [ ] Advanced analytics and reporting

### Phase 3 (Future)
- [ ] Machine learning model training
- [ ] Advanced document understanding
- [ ] Predictive analytics
- [ ] IoT device integration
\`\`\`

```json file="" isHidden
