"""
Test script for KMRL AI Induction API
"""

import requests
import json

def test_induction_api():
    """Test the induction API endpoints"""
    base_url = "http://localhost:3000"
    
    # Test headers (you would need proper auth token)
    headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer your_token_here'  # Replace with actual token
    }
    
    print("🧪 Testing KMRL AI Induction API")
    print("=" * 50)
    
    # Test GET endpoint
    try:
        print("📡 Testing GET /api/ai/induction...")
        response = requests.get(f"{base_url}/api/ai/induction", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ GET Success: {data['data']['totalTrains']} trains found")
            print(f"   Top train: {data['data']['results'][0]['Train ID']} - {data['data']['results'][0]['Induction Score']}/100")
        else:
            print(f"❌ GET Failed: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"❌ GET Error: {e}")
    
    # Test POST endpoint
    try:
        print("\n📡 Testing POST /api/ai/induction...")
        response = requests.post(f"{base_url}/api/ai/induction", 
                               json={"forceRegenerate": True}, 
                               headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ POST Success: Results regenerated at {data['data']['timestamp']}")
        else:
            print(f"❌ POST Failed: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"❌ POST Error: {e}")

if __name__ == "__main__":
    test_induction_api()