#!/usr/bin/env python3
"""
This script generates seed data for the TaskUp application.
It can be used to populate the database with initial data for testing and development.
"""

import json
import random
from datetime import datetime, timedelta
import os

# Base data structure
data = {
    "users": [],
    "projects": [],
    "teams": [],
    "tasks": [],
    "notifications": []
}

# Generate 15 users
user_roles = ["UX Designer", "Frontend Developer", "Backend Developer", "Project Manager", 
              "DevOps Engineer", "QA Engineer", "Marketing Specialist", "Content Creator",
              "Data Analyst", "Product Manager", "UI Designer", "Full Stack Developer"]

first_names = ["John", "Sarah", "Michael", "Emily", "David", "Jessica", "Alex", "Olivia", 
               "Ryan", "Lisa", "Brian", "Amanda", "Daniel", "Sophia", "James"]

last_names = ["Doe", "Miller", "Chen", "Wong", "Garcia", "Lee", "Johnson", "Kim", 
              "Martinez", "Taylor", "Wilson", "Brown", "Smith", "Jones", "Williams"]

for i in range(15):
    user_id = f"user-{i+1}"
    data["users"].append({
        "id": user_id,
        "firstName": first_names[i],
        "lastName": last_names[i],
        "email": f"{first_names[i].lower()}.{last_names[i].lower()}@example.com",
        "role": random.choice(user_roles),
        "imageUrl": None,
        "lastLogin": (datetime.now() - timedelta(days=random.randint(0, 10))).isoformat(),
        "createdAt": (datetime.now() - timedelta(days=random.randint(30, 90))).isoformat()
    })

# Generate 5 projects
project_names = ["Website Redesign", "Mobile App Development", "Marketing Campaign", 
                "Product Launch", "Office Relocation"]

project_descriptions = [
    "Completely revamp the company website with modern design principles and improved UX.",
    "Create native iOS and Android applications with core functionality from our web platform.",
    "Launch Q2 marketing campaign across digital and traditional channels to increase brand awareness.",
    "Coordinate the launch of our new flagship product including PR, marketing, and sales training.",
    "Plan and execute the move to our new headquarters with minimal disruption to operations."
]

for i in range(5):
    project_id = f"project-{i+1}"
    
    # Create scope for each project
    scope = {
        "included": "- Feature A\n- Feature B\n- Feature C\n- Feature D",
        "excluded": "- Feature X\n- Feature Y\n- Feature Z",
        "startDate": (datetime.now() - timedelta(days=random.randint(0, 15))).strftime('%Y-%m-%d'),
        "endDate": (datetime.now() + timedelta(days=random.randint(30, 90))).strftime('%Y-%m-%d')
    }
    
    # Generate stakeholders for each project
    stakeholders = []
    project_users = random.sample(data["users"], random.randint(3, 6))
    total_percentage = 0
    
    for user in project_users:
        if total_percentage >= 90:
            break
            
        percentage = random.randint(10, 40)
        if total_percentage + percentage > 100:
            percentage = 100 - total_percentage
            
        total_percentage += percentage
        
        stakeholders.append({
            "id": f"stake-{user['id']}-{project_id}",
            "userId": user["id"],
            "userName": f"{user['firstName']} {user['lastName']}",
            "percentage": percentage,
            "role": random.choice(["Owner", "Developer", "Designer", "Consultant", "Manager"])
        })
    
    # Ensure total percentage is 100
    if stakeholders and total_percentage < 100:
        stakeholders[0]["percentage"] += (100 - total_percentage)
    
    # Create project
    project = {
        "id": project_id,
        "name": project_names[i],
        "description": project_descriptions[i],
        "progress": random.randint(0, 100),
        "status": random.choice(["Not Started", "In Progress", "Completed"]),
        "createdAt": (datetime.now() - timedelta(days=random.randint(15, 60))).strftime('%Y-%m-%d'),
        "scope": scope,
        "stakeholders": stakeholders,
        "attachments": []
    }
    
    data["projects"].append(project)

# Generate teams for each project
team_colors = ["blue", "purple", "green", "red", "yellow", "indigo"]

for project in data["projects"]:
    num_teams = random.randint(1, 3)
    team_names = ["Design Team", "Development Team", "Marketing Team", "QA Team", "DevOps Team"]
    
    selected_teams = random.sample(team_names, num_teams)
    
    for i, team_name in enumerate(selected_teams):
        team_id = f"team-{project['id']}-{i+1}"
        
        # Assign random members to team
        members = []
        team_users = random.sample(data["users"], random.randint(3, 5))
        
        for j, user in enumerate(team_users):
            members.append({
                "id": user["id"],
                "name": f"{user['firstName']} {user['lastName']}",
                "role": user["role"],
                "joinedDate": (datetime.now() - timedelta(days=random.randint(1, 30))).strftime('%b %d, %Y'),
                "isLeader": j == 0  # First user is team leader
            })
        
        team = {
            "id": team_id,
            "name": team_name,
            "projectId": project["id"],
            "projectName": project["name"],
            "description": f"Responsible for {team_name.lower().replace(' team', '')} tasks in the {project['name']} project.",
            "color": random.choice(team_colors),
            "createdDate": (datetime.now() - timedelta(days=random.randint(1, 30))).strftime('%b %d, %Y'),
            "members": members,
            "tasks": []
        }
        
        data["teams"].append(team)

# Generate tasks for each team
task_statuses = ["Not Started", "In Progress", "Completed"]
task_priorities = ["Low", "Medium", "High"]

task_titles = [
    "Design homepage mockup", "Implement authentication",
    "Create content for social media", "Optimize database queries",
    "Fix navigation menu", "Design email templates",
    "Update privacy policy", "Prepare Q2 marketing report",
    "Set up CI/CD pipeline", "Conduct user testing",
    "Create API documentation", "Design logo variations",
    "Implement search functionality", "Fix responsive design issues",
    "Add analytics tracking", "Optimize images for web",
    "Configure SSL certificates", "Create onboarding flow"
]

for team in data["teams"]:
    num_tasks = random.randint(2, 5)
    
    for i in range(num_tasks):
        task_id = f"task-{team['id']}-{i+1}"
        
        # Randomly assign to team member
        assignee = random.choice(team["members"])
        priority = random.choice(task_priorities)
        status = random.choice(task_statuses)
        
        task = {
            "id": task_id,
            "title": random.choice(task_titles),
            "description": f"This is a detailed description of the task that needs to be completed for the {team['projectName']} project.",
            "project": team["projectName"],
            "projectId": team["projectId"],
            "deadline": (datetime.now() + timedelta(days=random.randint(3, 30))).strftime('%Y-%m-%d'),
            "completed": status == "Completed",
            "status": status,
            "priority": priority,
            "assignedType": "user",
            "assignedTo": {
                "type": "user",
                "id": assignee["id"],
                "name": assignee["name"]
            },
            "createdAt": (datetime.now() - timedelta(days=random.randint(1, 15))).strftime('%Y-%m-%d'),
            "updatedAt": (datetime.now() - timedelta(days=random.randint(0, 5))).strftime('%Y-%m-%d'),
            "comments": [],
            "attachments": [],
            "subtasks": []
        }
        
        # Add subtasks for some tasks
        if random.random() > 0.5:
            num_subtasks = random.randint(2, 4)
            for j in range(num_subtasks):
                task["subtasks"].append({
                    "id": f"subtask-{task_id}-{j+1}",
                    "title": f"Subtask {j+1} for {task['title']}",
                    "completed": random.random() > 0.5
                })
        
        data["tasks"].append(task)
        team["tasks"].append({"id": task_id, "title": task["title"], "status": status})

# Generate notifications
notification_types = [
    "task_assigned", "comment", "task_completed", "project_update",
    "mention", "task_due"
]

notification_messages = [
    "{user} assigned you a new task \"{task}\"",
    "New comment on \"{task}\"",
    "Your task \"{task}\" was approved",
    "Project \"{project}\" deadline has been extended",
    "{user} mentioned you in a comment",
    "Task \"{task}\" is due tomorrow"
]

for i in range(25):
    notif_id = f"notification-{i+1}"
    notif_type = random.choice(notification_types)
    type_index = notification_types.index(notif_type)
    
    user = random.choice(data["users"])
    task = random.choice(data["tasks"]) if data["tasks"] else {"title": "Task Title"}
    project = random.choice(data["projects"]) if data["projects"] else {"name": "Project Name"}
    
    message = notification_messages[type_index].format(
        user=f"{user['firstName']} {user['lastName']}",
        task=task["title"],
        project=project["name"]
    )
    
    notification = {
        "id": notif_id,
        "type": notif_type,
        "message": message,
        "project": project["name"],
        "time": f"{random.randint(1, 24)} hours ago",
        "read": random.random() > 0.3
    }
    
    data["notifications"].append(notification)

# Save data to a JSON file that can be imported in JavaScript
output_path = "seedData.json"
with open(output_path, "w") as f:
    json.dump(data, f, indent=2)

print(f"Seed data generated and saved to {output_path}")
print(f"Generated {len(data['users'])} users, {len(data['projects'])} projects, {len(data['teams'])} teams, {len(data['tasks'])} tasks, and {len(data['notifications'])} notifications.")