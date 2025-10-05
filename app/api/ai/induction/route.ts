import { NextRequest, NextResponse } from 'next/server'
import { withAuth, getCurrentUser, type AuthenticatedRequest } from '@/lib/auth-middleware'
import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'

async function handleGetInduction(request: AuthenticatedRequest) {
  console.log('🚀 KMRL Induction Decision API called')
  
  try {
    const user = getCurrentUser(request)
    
    if (!user || user.role !== 'Operator') {
      return NextResponse.json({ 
        success: false, 
        error: 'Insufficient permissions' 
      }, { status: 403 })
    }

    const resultsPath = path.join(process.cwd(), 'ml', 'models', 'trained', 'induction_results.csv')
    
    // Check if results exist
    if (!fs.existsSync(resultsPath)) {
      return NextResponse.json({ 
        success: false, 
        error: 'No induction results available. Please generate first.' 
      }, { status: 404 })
    }

    // Read and parse CSV results
    const csvData = fs.readFileSync(resultsPath, 'utf-8')
    const lines = csvData.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',').map(h => h.trim())
    
    const results = lines.slice(1).map(line => {
      const values: string[] = []
      let current = ''
      let inQuotes = false
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      values.push(current.trim())
      
      const result: any = {}
      headers.forEach((header, index) => {
        result[header] = values[index] || ''
      })
      return result
    })

    return NextResponse.json({
      success: true,
      message: 'KMRL Induction decisions retrieved successfully',
      data: {
        totalTrains: results.length,
        results: results,
        lastGenerated: fs.statSync(resultsPath).mtime,
        algorithm: 'AI-Powered Multi-Model Decision System'
      }
    })

  } catch (error) {
    console.error('❌ KMRL Induction API Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to retrieve induction decisions',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function handlePostInduction(request: AuthenticatedRequest): Promise<NextResponse> {
  console.log('🔄 KMRL Induction Regeneration API called')
  
  try {
    const user = getCurrentUser(request)
    
    if (!user || user.role !== 'Operator') {
      return NextResponse.json({ 
        success: false, 
        error: 'Insufficient permissions' 
      }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const forceRegenerate = body.forceRegenerate || false

    return new Promise<NextResponse>((resolve) => {
      console.log('🐍 Starting Python ML induction system...')
      
      const pythonProcess = spawn('python', [
        path.join(process.cwd(), 'ml', 'quick_fix.py')
      ], {
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe']
      })

      let stdout = ''
      let stderr = ''

      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString()
        console.log('🐍 Python Output:', data.toString())
      })

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString()
        console.error('🐍 Python Error:', data.toString())
      })

      pythonProcess.on('close', (code) => {
        console.log(`🐍 Python process exited with code ${code}`)
        
        if (code === 0) {
          // Check if results were generated
          const resultsPath = path.join(process.cwd(), 'ml', 'models', 'trained', 'induction_results.csv')
          
          if (fs.existsSync(resultsPath)) {
            resolve(NextResponse.json({
              success: true,
              message: 'KMRL Induction decisions regenerated successfully',
              data: {
                regenerated: true,
                timestamp: new Date().toISOString(),
                pythonOutput: stdout,
                algorithm: 'AI-Powered Multi-Model Decision System'
              }
            }))
          } else {
            resolve(NextResponse.json({
              success: false,
              error: 'Python script completed but no results file generated',
              pythonOutput: stdout,
              pythonError: stderr
            }, { status: 500 }))
          }
        } else {
          resolve(NextResponse.json({
            success: false,
            error: `Python script failed with exit code ${code}`,
            pythonOutput: stdout,
            pythonError: stderr
          }, { status: 500 }))
        }
      })

      pythonProcess.on('error', (error) => {
        console.error('🐍 Python Process Error:', error)
        resolve(NextResponse.json({
          success: false,
          error: 'Failed to start Python process',
          details: error.message
        }, { status: 500 }))
      })

      // Timeout after 30 seconds
      setTimeout(() => {
        pythonProcess.kill()
        resolve(NextResponse.json({
          success: false,
          error: 'Python script timeout (30s)',
          pythonOutput: stdout,
          pythonError: stderr
        }, { status: 408 }))
      }, 30000)
    })

  } catch (error) {
    console.error('❌ KMRL Induction Regeneration Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to regenerate induction decisions',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Export the protected endpoints
export const GET = withAuth(handleGetInduction)
export const POST = withAuth(handlePostInduction)