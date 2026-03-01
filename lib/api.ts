const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function analyzeCompany(company: string) {
  try {
    const response = await fetch(`${API_URL}/api/v1/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        company_name: company,
        bank_id: '00000000-0000-0000-0000-000000000000',
        mode: 'auto'
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to analyze company:', error);
    throw error;
  }
}

export async function getHealthStatus() {
  try {
    const response = await fetch(`${API_URL}/health`);
    return await response.json();
  } catch (error) {
    console.error('Failed to get health status:', error);
    return null;
  }
}

export async function analyzePortfolio(companies: string[], riskTolerance: number = 0.5) {
  try {
    const response = await fetch(`${API_URL}/api/v1/portfolio/compare`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        companies: companies,
        risk_tolerance: riskTolerance
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to analyze portfolio:', error);
    throw error;
  }
}
