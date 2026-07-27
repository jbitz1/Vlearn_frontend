import os
import re

def replace_in_file(filepath, pattern, replacement):
    with open(filepath, 'r') as f:
        content = f.read()
    content = re.sub(pattern, replacement, content)
    with open(filepath, 'w') as f:
        f.write(content)

replace_in_file('/home/jason-bitega/Desktop/VL/vlearn_repositories/Vlearn_frontend/src/Pages/Home.jsx',
    r'/video-count\b(?!/)', '/video-count/')

replace_in_file('/home/jason-bitega/Desktop/VL/vlearn_repositories/Vlearn_frontend/src/Pages/Teacher/TeacherProfile.jsx',
    r"'/profile'", "'/profile/'")
    
replace_in_file('/home/jason-bitega/Desktop/VL/vlearn_repositories/Vlearn_frontend/src/Pages/User/User.jsx',
    r"'/profile'", "'/profile/'")

replace_in_file('/home/jason-bitega/Desktop/VL/vlearn_repositories/Vlearn_frontend/src/Components/SubscriptionPlan.jsx',
    r"'/plans'", "'/plans/'")

# Also `Questions/urls.py`
backend_qs = '/home/jason-bitega/Desktop/VL/vlearn_repositories/Vlearn_backend/Questions/urls.py'
with open(backend_qs, 'r') as f:
    content = f.read()

# remove `path('quizzes/<int:pk>', QuizDetailView.as_view(), name='quiz_detail'),`
content = re.sub(r"    path\('quizzes/<int:pk>', QuizDetailView\.as_view\(\), name='quiz_detail'\),\n", "", content)

with open(backend_qs, 'w') as f:
    f.write(content)

