// Document integration service for induction planning
export interface TrainDocument {
  id: string
  title: string
  category: 'maintenance' | 'safety' | 'compliance' | 'manual' | 'history'
  trainsetId?: number
  serialNo?: string
  fileUrl: string
  uploadedAt: Date
  status: 'active' | 'archived' | 'draft'
  relevanceScore?: number
}

export interface DocumentInsight {
  documentId: string
  title: string
  insight: string
  impact: 'high' | 'medium' | 'low'
  category: string
}

export class DocumentInductionService {
  
  // Get relevant documents for a specific trainset
  static async getTrainsetDocuments(trainsetId: number, serialNo: string): Promise<TrainDocument[]> {
    try {
      // For now, using mock data - in production, this would call the API
      const mockDocuments: TrainDocument[] = [
        {
          id: `doc-${trainsetId}-1`,
          title: `${serialNo} Maintenance Manual`,
          category: 'maintenance',
          trainsetId,
          serialNo,
          fileUrl: `/docs/${serialNo}_maintenance.pdf`,
          uploadedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date in last 30 days
          status: 'active',
          relevanceScore: 0.9
        },
        {
          id: `doc-${trainsetId}-2`,
          title: `${serialNo} Safety Compliance Report`,
          category: 'compliance',
          trainsetId,
          serialNo,
          fileUrl: `/docs/${serialNo}_safety.pdf`,
          uploadedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random date in last 7 days
          status: 'active',
          relevanceScore: 0.8
        },
        {
          id: `doc-${trainsetId}-3`,
          title: `${serialNo} Performance History`,
          category: 'history',
          trainsetId,
          serialNo,
          fileUrl: `/docs/${serialNo}_history.pdf`,
          uploadedAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000), // Random date in last 60 days
          status: 'active',
          relevanceScore: 0.7
        }
      ]
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500))
      return mockDocuments
      
      // Actual API call (commented out for now)
      // const response = await fetch(`/api/documents?trainset=${trainsetId}&search=${serialNo}`)
      // if (!response.ok) throw new Error('Failed to fetch documents')
      // return await response.json()
    } catch (error) {
      console.error('Error fetching trainset documents:', error)
      return []
    }
  }

  // Get maintenance documents for decision making
  static async getMaintenanceDocuments(trainsetId: number): Promise<TrainDocument[]> {
    try {
      const response = await fetch(`/api/documents?category=maintenance&trainset=${trainsetId}`)
      if (!response.ok) throw new Error('Failed to fetch maintenance documents')
      return await response.json()
    } catch (error) {
      console.error('Error fetching maintenance documents:', error)
      return []
    }
  }

  // Get document-based insights for induction decisions
  static async getDocumentInsights(trainsetId: number): Promise<DocumentInsight[]> {
    try {
      const documents = await this.getTrainsetDocuments(trainsetId, '')
      
      // Mock insights based on document analysis
      const insights: DocumentInsight[] = documents.map(doc => ({
        documentId: doc.id,
        title: doc.title,
        insight: this.generateInsight(doc),
        impact: this.calculateImpact(doc),
        category: doc.category
      }))

      return insights.filter(insight => insight.impact !== 'low')
    } catch (error) {
      console.error('Error generating document insights:', error)
      return []
    }
  }

  private static generateInsight(doc: TrainDocument): string {
    switch (doc.category) {
      case 'maintenance':
        return `Last maintenance record indicates ${Math.floor(Math.random() * 30)} days since service`
      case 'safety':
        return `Safety compliance updated ${Math.floor(Math.random() * 7)} days ago`
      case 'compliance':
        return `Fitness certificate valid for ${Math.floor(Math.random() * 90)} more days`
      case 'history':
        return `Historical performance shows ${Math.floor(Math.random() * 100)}% efficiency`
      default:
        return `Document contains relevant operational information`
    }
  }

  private static calculateImpact(doc: TrainDocument): 'high' | 'medium' | 'low' {
    if (doc.category === 'safety' || doc.category === 'compliance') return 'high'
    if (doc.category === 'maintenance') return 'medium'
    return 'low'
  }

  // Enhanced induction decision with document analysis
  static async enhanceInductionDecision(
    trainsetId: number, 
    serialNo: string, 
    baseDecision: string
  ): Promise<{
    decision: string
    confidence: number
    documentSupport: DocumentInsight[]
    recommendations: string[]
  }> {
    const insights = await this.getDocumentInsights(trainsetId)
    const maintenanceDocs = await this.getMaintenanceDocuments(trainsetId)
    
    // Analyze document insights to enhance decision
    const highImpactInsights = insights.filter(i => i.impact === 'high')
    const maintenanceInsights = insights.filter(i => i.category === 'maintenance')
    
    let enhancedDecision = baseDecision
    let confidence = 0.7 // Base confidence
    const recommendations: string[] = []

    // Adjust decision based on document insights
    if (highImpactInsights.length > 0) {
      confidence += 0.2
      recommendations.push('High-priority document insights available')
    }

    if (maintenanceInsights.length > 0) {
      confidence += 0.1
      recommendations.push('Recent maintenance records support decision')
    }

    if (maintenanceDocs.length === 0) {
      confidence -= 0.1
      recommendations.push('Consider updating maintenance documentation')
    }

    return {
      decision: enhancedDecision,
      confidence: Math.min(confidence, 1.0),
      documentSupport: insights.slice(0, 3), // Top 3 insights
      recommendations
    }
  }
}