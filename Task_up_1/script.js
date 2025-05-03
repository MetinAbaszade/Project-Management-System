document.addEventListener("DOMContentLoaded", () => {
    // Elements
    const loginPage = document.getElementById("login-page");
    const appContainer = document.getElementById("app-container");
    const loginForm = document.getElementById("login-form");
    const themeToggle = document.getElementById("theme-toggle");
    const wideToggle = document.getElementById("wide-toggle");
    const logoutBtn = document.getElementById("logout-btn");
    const createTeamBtn = document.getElementById("create-team-btn");
    const teamModal = document.getElementById("team-modal");
    const editTeamModal = document.getElementById("edit-team-modal");
    const membersModal = document.getElementById("members-modal");
    const addTeamBtn = document.getElementById("add-team-btn");
    const saveTeamBtn = document.getElementById("save-team-btn");
    const teamNameInput = document.getElementById("team-name-input");
    const editTeamNameInput = document.getElementById("edit-team-name-input");
    const teamsContainer = document.getElementById("teams-container");
    const closeModalBtns = document.querySelectorAll(".close-modal");
    const cancelBtns = document.querySelectorAll(".cancel-btn");
    const colorOptions = document.querySelectorAll(".color-option");
    const editColorOptions = document.querySelectorAll("#edit-color-options .color-option");
    const addMemberBtn = document.getElementById("add-member-btn");
    const memberNameInput = document.getElementById("member-name-input");
    const memberList = document.getElementById("member-list");
    const teamTitle = document.getElementById("team-title");
    
    let selectedColor = "#4CAF50";
    let editSelectedColor = "#4CAF50";
    let currentTeamId = null;
    let currentEditingTeamId = null;
    let teamsData = [];

    // Check if user is logged in
    checkLoginStatus();

    // Initialize
    initTheme();
    initWideMode();
    setupColorOptions();
    loadTeams();

    // Event Listeners
    if (loginForm) {
        loginForm.addEventListener("submit", handleLogin);
    }

    if (themeToggle) {
        themeToggle.addEventListener("click", toggleTheme);
    }

    if (wideToggle) {
        wideToggle.addEventListener("click", toggleWideMode);
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", handleLogout);
    }

    if (createTeamBtn) {
        createTeamBtn.addEventListener("click", () => openModal(teamModal));
    }

    if (addTeamBtn) {
        addTeamBtn.addEventListener("click", createNewTeam);
    }

    if (saveTeamBtn) {
        saveTeamBtn.addEventListener("click", saveTeamChanges);
    }

    if (addMemberBtn) {
        addMemberBtn.addEventListener("click", addNewMember);
    }

    // Close modal buttons
    closeModalBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            closeAllModals();
        });
    });

    // Cancel buttons
    cancelBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            closeAllModals();
        });
    });

    // Functions
    function checkLoginStatus() {
        const isLoggedIn = localStorage.getItem("isLoggedIn");
        
        if (isLoggedIn === "true") {
            showApp();
        } else {
            showLogin();
        }
    }

    function handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        
        // For demo purposes, accept any credentials or use the demo ones
        if ((username && password) || (username === "user" && password === "password")) {
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("username", username);
            
            // Show success message
            showToast("Login successful! Welcome back.", "success");
            
            // Animate transition
            loginPage.classList.add("app-fade-out");
            setTimeout(() => {
                showApp();
                appContainer.classList.add("app-fade-in");
            }, 500);
        } else {
            showToast("Invalid credentials. Please try again.", "error");
        }
    }

    function handleLogout() {
        // Confirm before logout
        if (confirm("Are you sure you want to logout?")) {
            localStorage.removeItem("isLoggedIn");
            
            // Animate transition
            appContainer.classList.add("app-fade-out");
            setTimeout(() => {
                showLogin();
                loginPage.classList.add("app-fade-in");
            }, 500);
            
            showToast("You have been logged out successfully.", "info");
        }
    }

    function showLogin() {
        loginPage.classList.remove("hidden");
        appContainer.classList.add("hidden");
    }

    function showApp() {
        loginPage.classList.add("hidden");
        appContainer.classList.remove("hidden");
        
        // Set the avatar initials based on username
        const username = localStorage.getItem("username") || "User";
        const avatar = document.querySelector(".avatar");
        if (avatar) {
            avatar.textContent = getInitials(username);
        }
    }

    function getInitials(name) {
        const names = name.split(" ");
        if (names.length === 1) {
            return names[0].substring(0, 2).toUpperCase();
        } else {
            return (names[0][0] + names[names.length - 1][0]).toUpperCase();
        }
    }

    function initTheme() {
        const isDarkMode = localStorage.getItem("darkMode") === "true";
        
        if (isDarkMode) {
            document.body.classList.add("dark-mode");
            if (themeToggle) {
                themeToggle.innerHTML = '<i class="fas fa-sun"></i><span>Light Mode</span>';
            }
        }
    }

    function toggleTheme() {
        const isDarkMode = document.body.classList.toggle("dark-mode");
        localStorage.setItem("darkMode", isDarkMode);
        
        if (isDarkMode) {
            themeToggle.innerHTML = '<i class="fas fa-sun"></i><span>Light Mode</span>';
            showToast("Dark mode enabled", "info");
        } else {
            themeToggle.innerHTML = '<i class="fas fa-moon"></i><span>Dark Mode</span>';
            showToast("Light mode enabled", "info");
        }
    }

    function initWideMode() {
        const isWideMode = localStorage.getItem("wideMode") === "true";
        
        if (isWideMode) {
            document.body.classList.add("wide-mode");
            if (wideToggle) {
                wideToggle.innerHTML = '<i class="fas fa-compress"></i><span>Normal Mode</span>';
            }
        }
    }

    function toggleWideMode() {
        const isWideMode = document.body.classList.toggle("wide-mode");
        localStorage.setItem("wideMode", isWideMode);
        
        if (isWideMode) {
            wideToggle.innerHTML = '<i class="fas fa-compress"></i><span>Normal Mode</span>';
            showToast("Wide mode enabled", "info");
        } else {
            wideToggle.innerHTML = '<i class="fas fa-expand"></i><span>Wide Mode</span>';
            showToast("Normal mode enabled", "info");
        }
    }

    function setupColorOptions() {
        // Setup color selection for new team
        colorOptions.forEach(option => {
            const color = option.getAttribute("data-color");
            option.style.backgroundColor = color;
            
            option.addEventListener("click", () => {
                // Remove selected class from all options
                colorOptions.forEach(opt => opt.classList.remove("selected"));
                // Add selected class to clicked option
                option.classList.add("selected");
                selectedColor = color;
            });
            
            // Set initial selected color
            if (color === selectedColor) {
                option.classList.add("selected");
            }
        });
        
        // Setup color selection for edit team
        editColorOptions.forEach(option => {
            const color = option.getAttribute("data-color");
            option.style.backgroundColor = color;
            
            option.addEventListener("click", () => {
                // Remove selected class from all options
                editColorOptions.forEach(opt => opt.classList.remove("selected"));
                // Add selected class to clicked option
                option.classList.add("selected");
                editSelectedColor = color;
            });
        });
    }

    function loadTeams() {
        // Load teams from localStorage
        const savedTeams = localStorage.getItem("teamsData");
        
        if (savedTeams) {
            teamsData = JSON.parse(savedTeams);
            renderTeams();
        } else {
            // Show empty state
            teamsContainer.innerHTML = `
                <div class="no-teams-message">
                    <i class="fas fa-users"></i>
                    <h3>No teams yet</h3>
                    <p>Create your first team to get started</p>
                </div>
            `;
        }
    }

    function saveTeams() {
        localStorage.setItem("teamsData", JSON.stringify(teamsData));
    }

    function createNewTeam() {
        const teamName = teamNameInput.value.trim();
        
        if (!teamName) {
            showToast("Please enter a team name", "warning");
            return;
        }
        
        const newTeam = {
            id: Date.now().toString(),
            name: teamName,
            color: selectedColor,
            members: []
        };
        
        teamsData.push(newTeam);
        saveTeams();
        renderTeams();
        
        // Reset form and close modal
        teamNameInput.value = "";
        closeAllModals();
        
        showToast(`Team "${teamName}" created successfully!`, "success");
    }

    function saveTeamChanges() {
        const teamName = editTeamNameInput.value.trim();
        
        if (!teamName) {
            showToast("Please enter a team name", "warning");
            return;
        }
        
        const teamIndex = teamsData.findIndex(team => team.id === currentEditingTeamId);
        
        if (teamIndex !== -1) {
            teamsData[teamIndex].name = teamName;
            teamsData[teamIndex].color = editSelectedColor;
            
            saveTeams();
            renderTeams();
            
            // Reset form and close modal
            editTeamNameInput.value = "";
            closeAllModals();
            
            showToast(`Team "${teamName}" updated successfully!`, "success");
        }
    }

    function renderTeams() {
        if (teamsData.length === 0) {
            teamsContainer.innerHTML = `
                <div class="no-teams-message">
                    <i class="fas fa-users"></i>
                    <h3>No teams yet</h3>
                    <p>Create your first team to get started</p>
                </div>
            `;
            return;
        }
        
        teamsContainer.innerHTML = "";
        
        teamsData.forEach(team => {
            // Create displayed members list (limit to 4)
            const displayedMembers = team.members.slice(0, 4);
            const extraMembersCount = Math.max(0, team.members.length - 4);
            
            let membersHTML = "";
            
            if (displayedMembers.length > 0) {
                membersHTML = `
                    <div class="member-avatars">
                        ${displayedMembers.map(member => `
                            <div class="member-avatar" style="background-color: ${team.color}">
                                ${getInitials(member)}
                            </div>
                        `).join("")}
                    </div>
                    ${extraMembersCount > 0 ? `<span class="more-members">+${extraMembersCount} more</span>` : ""}
                `;
            } else {
                membersHTML = `<span class="more-members">No members yet</span>`;
            }
            
            const teamCard = document.createElement("div");
            teamCard.className = "team-card";
            teamCard.innerHTML = `
                <div class="team-card-header" style="background-color: ${team.color}">
                    <h3>${team.name}</h3>
                    <div class="team-actions">
                        <button class="edit-team" data-id="${team.id}"><i class="fas fa-edit"></i></button>
                        <button class="delete-team" data-id="${team.id}"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
                <div class="team-card-body">
                    <div class="team-member-count">
                        <i class="fas fa-user"></i> ${team.members.length} Member${team.members.length !== 1 ? "s" : ""}
                    </div>
                    <div class="member-preview">
                        ${membersHTML}
                    </div>
                </div>
                <div class="team-card-footer">
                    <button class="view-members-btn" data-id="${team.id}">Manage Members</button>
                </div>
            `;
            
            teamsContainer.appendChild(teamCard);
            
            // Add event listeners to the newly created buttons
            teamCard.querySelector(".edit-team").addEventListener("click", e => {
                e.stopPropagation();
                openEditTeamModal(team.id);
            });
            
            teamCard.querySelector(".delete-team").addEventListener("click", e => {
                e.stopPropagation();
                deleteTeam(team.id);
            });
            
            teamCard.querySelector(".view-members-btn").addEventListener("click", () => {
                openMembersModal(team.id);
            });
        });
    }

    function openModal(modal) {
        closeAllModals();
        modal.classList.add("active");
        
        // Add animation
        setTimeout(() => {
            if (modal === teamModal && teamNameInput) {
                teamNameInput.focus();
            } else if (modal === editTeamModal && editTeamNameInput) {
                editTeamNameInput.focus();
            } else if (modal === membersModal && memberNameInput) {
                memberNameInput.focus();
            }
        }, 300);
    }

    function closeAllModals() {
        document.querySelectorAll(".modal").forEach(modal => {
            modal.classList.remove("active");
        });
    }

    function openEditTeamModal(teamId) {
        currentEditingTeamId = teamId;
        const team = teamsData.find(t => t.id === teamId);
        
        if (team) {
            editTeamNameInput.value = team.name;
            editSelectedColor = team.color;
            
            // Update selected color
            editColorOptions.forEach(option => {
                const color = option.getAttribute("data-color");
                option.classList.toggle("selected", color === team.color);
            });
            
            openModal(editTeamModal);
        }
    }

    function deleteTeam(teamId) {
        if (confirm("Are you sure you want to delete this team?")) {
            teamsData = teamsData.filter(team => team.id !== teamId);
            saveTeams();
            renderTeams();
            
            showToast("Team deleted successfully", "success");
        }
    }

    function openMembersModal(teamId) {
        currentTeamId = teamId;
        const team = teamsData.find(t => t.id === teamId);
        
        if (team) {
            teamTitle.textContent = `${team.name} - Team Members`;
            renderMembers(team.members);
            openModal(membersModal);
        }
    }

    function renderMembers(members) {
        memberList.innerHTML = "";
        
        if (members.length === 0) {
            memberList.innerHTML = `<li class="no-members">No members yet. Add your first team member above.</li>`;
            return;
        }
        
        members.forEach((member, index) => {
            const li = document.createElement("li");
            li.innerHTML = `
                <div class="member-info">
                    <div class="member-avatar" style="background-color: ${teamsData.find(t => t.id === currentTeamId).color}">
                        ${getInitials(member)}
                    </div>
                    <span>${member}</span>
                </div>
                <button class="remove-member" data-index="${index}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            memberList.appendChild(li);
            
            // Add event listener to remove button
            li.querySelector(".remove-member").addEventListener("click", () => {
                removeMember(index);
            });
        });
    }

    function addNewMember() {
        const memberName = memberNameInput.value.trim();
        
        if (!memberName) {
            showToast("Please enter a member name", "warning");
            return;
        }
        
        const teamIndex = teamsData.findIndex(team => team.id === currentTeamId);
        
        if (teamIndex !== -1) {
            // Check if member already exists
            if (teamsData[teamIndex].members.includes(memberName)) {
                showToast("This member already exists in the team", "warning");
                return;
            }
            
            teamsData[teamIndex].members.push(memberName);
            saveTeams();
            
            // Clear input and render updated members list
            memberNameInput.value = "";
            renderMembers(teamsData[teamIndex].members);
            
            // Also update the teams display
            renderTeams();
            
            showToast(`${memberName} added to the team!`, "success");
        }
    }

    function removeMember(index) {
        const teamIndex = teamsData.findIndex(team => team.id === currentTeamId);
        
        if (teamIndex !== -1) {
            const memberName = teamsData[teamIndex].members[index];
            teamsData[teamIndex].members.splice(index, 1);
            saveTeams();
            
            renderMembers(teamsData[teamIndex].members);
            renderTeams();
            
            showToast(`${memberName} removed from the team`, "info");
        }
    }

    function showToast(message, type = "info") {
        // Create toast element
        const toast = document.createElement("div");
        toast.className = `toast ${type}`;
        
        let icon = "fas fa-info-circle";
        if (type === "success") icon = "fas fa-check-circle";
        if (type === "error") icon = "fas fa-exclamation-circle";
        if (type === "warning") icon = "fas fa-exclamation-triangle";
        
        toast.innerHTML = `
            <i class="${icon}"></i>
            <div class="toast-message">${message}</div>
        `;
        
        document.body.appendChild(toast);
        
        // Show toast
        setTimeout(() => toast.classList.add("show"), 10);
        
        // Hide and remove toast after delay
        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    }

    // Close modals when clicking outside
    window.addEventListener("click", e => {
        document.querySelectorAll(".modal").forEach(modal => {
            if (e.target === modal) {
                closeAllModals();
            }
        });
    });

    // Handle Escape key to close modals
    document.addEventListener("keydown", e => {
        if (e.key === "Escape") {
            closeAllModals();
        }
    });
});