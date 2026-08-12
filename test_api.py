import urllib.request
import urllib.error
import json
import uuid

base_url = "http://localhost:8080/api"

def request(method, path, data=None, token=None):
    req = urllib.request.Request(f"{base_url}{path}", method=method)
    if data:
        req.add_header('Content-Type', 'application/json')
        data = json.dumps(data).encode('utf-8')
    if token:
        req.add_header('Authorization', f'Bearer {token}')
    try:
        with urllib.request.urlopen(req, data=data) as response:
            res_body = response.read().decode('utf-8')
            if res_body:
                try:
                    return json.loads(res_body)
                except json.JSONDecodeError:
                    return res_body
            return None
    except urllib.error.HTTPError as e:
        res_body = e.read().decode('utf-8')
        raise Exception(f"HTTP {e.code}: {res_body}")

# 1. Register and Login Student
student_email = f"student_{uuid.uuid4().hex[:6]}@test.com"
request('POST', '/auth/register', {
    "email": student_email, 
    "password": "pass", 
    "role": "STUDENT",
    "name": "Test Student",
    "rollNo": f"R{uuid.uuid4().hex[:6]}",
    "branch": "CSE",
    "cgpa": 8.0,
    "graduationYear": 2026
})
token_res = request('POST', '/auth/login', {"email": student_email, "password": "pass"})
student_token = token_res['token']
print("Student registered and logged in.")

# 2. Get Profile & Update with isOptedOut = true
prof = request('GET', '/student/profile', token=student_token)
prof['isOptedOut'] = True
prof['department'] = 'CSE' # Set required fields
prof['cgpa'] = 8.0
prof['graduationYear'] = 2026
request('PUT', '/student/profile', data=prof, token=student_token)
prof = request('GET', '/student/profile', token=student_token)
assert prof['isOptedOut'] == True
print("Student opted out successfully.")

# 3. Register and Login Company
company_email = f"company_{uuid.uuid4().hex[:6]}@test.com"
request('POST', '/auth/register', {
    "email": company_email, 
    "password": "pass", 
    "role": "COMPANY",
    "companyName": "Test Company"
})
token_res = request('POST', '/auth/login', {"email": company_email, "password": "pass"})
company_token = token_res['token']
print("Company registered and logged in.")

# 4. Post Job with Test Details
job_data = {
    "jobTitle": "Test Job",
    "description": "Test Desc",
    "minCgpa": 6.0,
    "location": "Remote",
    "salaryPackage": "10 LPA",
    "requiredSkills": "Java",
    "eligibilityCriteria": "None",
    "lastDateToApply": "2026-12-31",
    "ctcComponents": "Base",
    "selectionRounds": "2",
    "bondDetails": "No",
    "eligibleBranches": "ALL",
    "testPlatform": "HackerRank",
    "testDatetime": "2026-08-01T10:00:00",
    "testLink": "http://hackerrank.com/test"
}
job = request('POST', '/companies/jobs', data=job_data, token=company_token)
job_id = job['id']
print(f"Company posted job {job_id} with test details.")

# 5. Apply as opted-out student (should fail)
try:
    request('POST', f'/jobs/{job_id}/apply', token=student_token)
    print("ERROR: Application succeeded but should have failed!")
except Exception as e:
    print(f"Expected failure when opted out: {e}")

# 6. Opt-in student and apply again
prof['isOptedOut'] = False
request('PUT', '/student/profile', data=prof, token=student_token)
print("Student opted in.")

request('POST', f'/jobs/{job_id}/apply', token=student_token)
print("Application successful after opting in.")

# 7. Company changes status
apps = request('GET', f'/companies/jobs/{job_id}/applications', token=company_token)
app_id = apps[0]['application_id']
request('PUT', f'/companies/applications/{app_id}/status', data={"status": "SHORTLISTED"}, token=company_token)
print("Company shortlisted the student.")

print("ALL TESTS PASSED SUCCESSFULLY!")
