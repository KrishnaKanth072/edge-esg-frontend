const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function analyzeCompany(company: string) {
  try {
    const response = await fetch(`${API_URL}/api/v1/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        company,
        metrics: ['environmental', 'social', 'governance'],
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
