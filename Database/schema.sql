-- 1. Languages
CREATE TABLE IF NOT EXISTS Languages (
    Id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    LanguageName VARCHAR(50) NOT NULL UNIQUE,
    LanguageCode VARCHAR(10) NOT NULL UNIQUE,
    IsDeleted BOOLEAN DEFAULT FALSE,
    DisplayOrder INT DEFAULT 0
) ENGINE=InnoDB;

-- 2. Roles
CREATE TABLE IF NOT EXISTS Roles (
    Id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    RoleName VARCHAR(50) NOT NULL UNIQUE,
    IsAdmin BOOLEAN DEFAULT FALSE,
    Description VARCHAR(255),
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    IsDeleted BOOLEAN DEFAULT FALSE
) ENGINE=InnoDB;

-- 3. Users
CREATE TABLE IF NOT EXISTS Users (
    Id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    ImageUrl VARCHAR(255),
    IsDeleted BOOLEAN DEFAULT FALSE,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    LastLogin DATETIME,
    ResetToken VARCHAR(255),
    ResetTokenExpires DATETIME,
    LoginAttempts INT DEFAULT 0,
    LastPasswordChange DATETIME,
    RequirePasswordChange BOOLEAN DEFAULT FALSE
) ENGINE=InnoDB;

-- 4. Projects
CREATE TABLE IF NOT EXISTS Projects (
    Id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    Name VARCHAR(100) NOT NULL,
    Description TEXT,
    StartDate DATE,
    EndDate DATE,
    Status ENUM('Planning', 'Active', 'On Hold', 'Completed', 'Canceled') DEFAULT 'Planning',
    Budget DECIMAL(15, 2),
    BudgetUsed DECIMAL(15, 2) DEFAULT 0,
    OwnerId CHAR(36) NOT NULL,
    IsPublic BOOLEAN DEFAULT FALSE,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    EstimatedHours FLOAT,
    ActualHours FLOAT DEFAULT 0,
    CompletionPercentage FLOAT DEFAULT 0,
    IsDeleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (OwnerId) REFERENCES Users(Id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 5. Task Types
CREATE TABLE IF NOT EXISTS TaskTypes (
    Id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    TypeName VARCHAR(50) NOT NULL UNIQUE,
    Description VARCHAR(255),
    Color VARCHAR(7),
    Icon VARCHAR(50),
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    IsDeleted BOOLEAN DEFAULT FALSE
) ENGINE=InnoDB;

-- 6. Tasks
CREATE TABLE IF NOT EXISTS Tasks (
    Id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    ProjectId CHAR(36) NOT NULL,
    Title VARCHAR(100) NOT NULL,
    Description TEXT,
    Type CHAR(36),
    Priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
    Status ENUM('Backlog', 'Todo', 'InProgress', 'Review', 'Done') DEFAULT 'Backlog',
    CreatedBy CHAR(36),
    AssignedTo CHAR(36),
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    Deadline DATETIME,
    EstimatedHours FLOAT,
    ActualHours FLOAT DEFAULT 0,
    BudgetUsed DECIMAL(10, 2) DEFAULT 0,
    Tags VARCHAR(255),
    IsBillable BOOLEAN DEFAULT TRUE,
    CompletionPercentage FLOAT DEFAULT 0,
    IsDeleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (ProjectId) REFERENCES Projects(Id) ON DELETE CASCADE,
    FOREIGN KEY (CreatedBy) REFERENCES Users(Id) ON DELETE SET NULL,
    FOREIGN KEY (AssignedTo) REFERENCES Users(Id) ON DELETE SET NULL,
    FOREIGN KEY (Type) REFERENCES TaskTypes(Id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 7. Labels
CREATE TABLE IF NOT EXISTS Labels (
    Id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    Name VARCHAR(50) NOT NULL,
    Color VARCHAR(7),
    ProjectId CHAR(36),
    CreatedBy CHAR(36),
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    IsDeleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (ProjectId) REFERENCES Projects(Id) ON DELETE CASCADE,
    FOREIGN KEY (CreatedBy) REFERENCES Users(Id) ON DELETE SET NULL,
    UNIQUE KEY UniqueLabelProject (Name, ProjectId)
) ENGINE=InnoDB;

-- 8. Task Labels
CREATE TABLE IF NOT EXISTS TaskLabels (
    TaskId CHAR(36) NOT NULL,
    LabelId CHAR(36) NOT NULL,
    AddedBy CHAR(36),
    AddedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    IsDeleted BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (TaskId, LabelId),
    FOREIGN KEY (TaskId) REFERENCES Tasks(Id) ON DELETE CASCADE,
    FOREIGN KEY (LabelId) REFERENCES Labels(Id) ON DELETE CASCADE,
    FOREIGN KEY (AddedBy) REFERENCES Users(Id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 9. Subtasks
CREATE TABLE IF NOT EXISTS Subtasks (
    Id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    ParentTaskId CHAR(36) NOT NULL,
    AssignedTo CHAR(36),
    Title VARCHAR(100) NOT NULL,
    Description TEXT,
    Status ENUM('Todo', 'InProgress', 'Done') DEFAULT 'Todo',
    EstimatedHours FLOAT,
    ActualHours FLOAT DEFAULT 0,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    Deadline DATETIME,
    IsDeleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (ParentTaskId) REFERENCES Tasks(Id) ON DELETE CASCADE,
    FOREIGN KEY (AssignedTo) REFERENCES Users(Id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 10. Task Dependencies
CREATE TABLE IF NOT EXISTS TaskDependencies (
    TaskId CHAR(36) NOT NULL,
    DependentTaskId CHAR(36) NOT NULL,
    DependencyType ENUM('Blocks', 'Is blocked by', 'Relates to') DEFAULT 'Blocks',
    CreatedBy CHAR(36),
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    IsDeleted BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (TaskId, DependentTaskId),
    FOREIGN KEY (TaskId) REFERENCES Tasks(Id) ON DELETE CASCADE,
    FOREIGN KEY (DependentTaskId) REFERENCES Tasks(Id) ON DELETE CASCADE,
    FOREIGN KEY (CreatedBy) REFERENCES Users(Id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 11. Task Status History
CREATE TABLE IF NOT EXISTS TaskStatusHistory (
    Id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    TaskId CHAR(36) NOT NULL,
    UserId CHAR(36),
    OldStatus VARCHAR(20) NOT NULL,
    NewStatus VARCHAR(20) NOT NULL,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    Notes TEXT,
    TimeInStatus INT,
    IsDeleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (TaskId) REFERENCES Tasks(Id) ON DELETE CASCADE,
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 12. Task Attachments
CREATE TABLE IF NOT EXISTS TaskAttachments (
    Id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    TaskId CHAR(36) NOT NULL,
    FileUrl VARCHAR(255) NOT NULL,
    FileName VARCHAR(100) NOT NULL,
    FileSize INT,
    FileType VARCHAR(50),
    UploadedBy CHAR(36),
    UploadedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    Description TEXT,
    IsDeleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (TaskId) REFERENCES Tasks(Id) ON DELETE CASCADE,
    FOREIGN KEY (UploadedBy) REFERENCES Users(Id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 13. Time Entries
CREATE TABLE IF NOT EXISTS TimeEntries (
    Id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    TaskId CHAR(36) NOT NULL,
    UserId CHAR(36) NOT NULL,
    TimeSpent FLOAT NOT NULL,
    EntryDate DATE NOT NULL,
    StartTime TIME,
    EndTime TIME,
    Description TEXT,
    Billable BOOLEAN DEFAULT TRUE,
    ApprovedBy CHAR(36),
    ApprovedAt DATETIME,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    IsDeleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (TaskId) REFERENCES Tasks(Id) ON DELETE CASCADE,
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    FOREIGN KEY (ApprovedBy) REFERENCES Users(Id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 14. Sprints
CREATE TABLE IF NOT EXISTS Sprints (
    Id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    ProjectId CHAR(36) NOT NULL,
    Name VARCHAR(100) NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    Goal TEXT,
    Status ENUM('Planning', 'Active', 'Completed', 'Canceled') DEFAULT 'Planning',
    Capacity FLOAT,
    Velocity FLOAT,
    RetrospectiveNotes TEXT,
    CreatedBy CHAR(36),
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    CompletedAt DATETIME,
    IsDeleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (ProjectId) REFERENCES Projects(Id) ON DELETE CASCADE,
    FOREIGN KEY (CreatedBy) REFERENCES Users(Id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 15. Sprint Tasks
CREATE TABLE IF NOT EXISTS SprintTasks (
    SprintId CHAR(36) NOT NULL,
    TaskId CHAR(36) NOT NULL,
    AddedBy CHAR(36),
    AddedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    StoryPoints FLOAT,
    IsDeleted BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (SprintId, TaskId),
    FOREIGN KEY (SprintId) REFERENCES Sprints(Id) ON DELETE CASCADE,
    FOREIGN KEY (TaskId) REFERENCES Tasks(Id) ON DELETE CASCADE,
    FOREIGN KEY (AddedBy) REFERENCES Users(Id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 16. Boards
CREATE TABLE IF NOT EXISTS Boards (
    Id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    ProjectId CHAR(36) NOT NULL,
    Name VARCHAR(100) NOT NULL,
    BoardType ENUM('Kanban', 'Scrum', 'Custom') DEFAULT 'Kanban',
    Description TEXT,
    IsDefault BOOLEAN DEFAULT FALSE,
    CreatedBy CHAR(36),
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    IsDeleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (ProjectId) REFERENCES Projects(Id) ON DELETE CASCADE,
    FOREIGN KEY (CreatedBy) REFERENCES Users(Id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 17. Board Columns
CREATE TABLE IF NOT EXISTS BoardColumns (
    Id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    BoardId CHAR(36) NOT NULL,
    Name VARCHAR(50) NOT NULL,
    OrderIndex INT NOT NULL,
    WipLimit INT,
    TaskStatus VARCHAR(20),
    Description TEXT,
    Color VARCHAR(7),
    IsDeleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (BoardId) REFERENCES Boards(Id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 18. Project Members
CREATE TABLE IF NOT EXISTS ProjectMembers (
    Id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    ProjectId CHAR(36) NOT NULL,
    UserId CHAR(36) NOT NULL,
    RoleInProject VARCHAR(50),
    MemberType ENUM('Owner', 'Collaborator') DEFAULT 'Collaborator',
    TotalHoursWorked FLOAT DEFAULT 0,
    HourlyRate DECIMAL(10,2),
    JoinedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    InvitedBy CHAR(36),
    IsDeleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (ProjectId) REFERENCES Projects(Id) ON DELETE CASCADE,
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    FOREIGN KEY (InvitedBy) REFERENCES Users(Id) ON DELETE SET NULL,
    UNIQUE KEY UniqueProjectUser (ProjectId, UserId)
) ENGINE=InnoDB;

-- 19. Project Attachments
CREATE TABLE IF NOT EXISTS ProjectAttachments (
    Id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    ProjectId CHAR(36) NOT NULL,
    FileUrl VARCHAR(255) NOT NULL,
    FileName VARCHAR(100) NOT NULL,
    FileSize INT,
    FileType VARCHAR(50),
    UploadedBy CHAR(36),
    UploadedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    Description TEXT,
    IsDeleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (ProjectId) REFERENCES Projects(Id) ON DELETE CASCADE,
    FOREIGN KEY (UploadedBy) REFERENCES Users(Id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 20. Project Languages
CREATE TABLE IF NOT EXISTS ProjectLanguages (
    Id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    ProjectId CHAR(36) NOT NULL,
    LanguageId CHAR(36) NOT NULL,
    UsagePercentage FLOAT DEFAULT 0,
    Notes TEXT,
    IsDeleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (ProjectId) REFERENCES Projects(Id) ON DELETE CASCADE,
    FOREIGN KEY (LanguageId) REFERENCES Languages(Id) ON DELETE CASCADE,
    UNIQUE KEY UniqueProjLang (ProjectId, LanguageId)
) ENGINE=InnoDB;

-- 21. Notifications
CREATE TABLE IF NOT EXISTS Notifications (
    Id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    UserId CHAR(36) NOT NULL,
    Title VARCHAR(100),
    Content TEXT NOT NULL,
    NotificationType VARCHAR(50) NOT NULL,
    EntityType VARCHAR(50),
    EntityId CHAR(36),
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    IsRead BOOLEAN DEFAULT FALSE,
    ReadAt DATETIME,
    Link VARCHAR(255),
    SourceUserId CHAR(36),
    IsDeleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    FOREIGN KEY (SourceUserId) REFERENCES Users(Id) ON DELETE SET NULL
) ENGINE=InnoDB;

DELIMITER //
CREATE PROCEDURE sp_create_index_notifications_user()
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.statistics 
    WHERE table_schema = DATABASE() 
      AND table_name = 'Notifications' 
      AND index_name = 'idx_notifications_user'
  ) THEN
    SET @s = 'CREATE INDEX idx_notifications_user ON Notifications(UserId, IsRead)';
    PREPARE stmt FROM @s;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END //
DELIMITER ;

CALL sp_create_index_notifications_user();
DROP PROCEDURE sp_create_index_notifications_user;

DELIMITER //
CREATE PROCEDURE sp_create_index_notifications_entity()
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.statistics 
    WHERE table_schema = DATABASE() 
      AND table_name = 'Notifications' 
      AND index_name = 'idx_notifications_entity'
  ) THEN
    SET @s = 'CREATE INDEX idx_notifications_entity ON Notifications(EntityType, EntityId)';
    PREPARE stmt FROM @s;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END //
DELIMITER ;

CALL sp_create_index_notifications_entity();
DROP PROCEDURE sp_create_index_notifications_entity;

-- 22. System Notifications
CREATE TABLE IF NOT EXISTS SystemNotifications (
    Id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    Title VARCHAR(100) NOT NULL,
    Content TEXT NOT NULL,
    Severity ENUM('Info','Warning','Critical') DEFAULT 'Info',
    StartDate DATETIME NOT NULL,
    EndDate DATETIME,
    IsDismissible BOOLEAN DEFAULT TRUE,
    TargetRoles VARCHAR(255),
    TargetUsers VARCHAR(255),
    CreatedBy CHAR(36),
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    IsDeleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (CreatedBy) REFERENCES Users(Id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 23. Admin Settings
CREATE TABLE IF NOT EXISTS AdminSettings (
    Id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    SettingKey VARCHAR(100) NOT NULL UNIQUE,
    SettingValue TEXT,
    Category VARCHAR(50) NOT NULL,
    Description TEXT,
    IsEncrypted BOOLEAN DEFAULT FALSE,
    DataType ENUM('string','number','boolean','json','date') DEFAULT 'string',
    ValidationRegex VARCHAR(255),
    DefaultValue TEXT,
    LastUpdated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UpdatedBy CHAR(36),
    IsDeleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (UpdatedBy) REFERENCES Users(Id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 24. Audit Logs
CREATE TABLE IF NOT EXISTS AuditLogs (
    Id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    UserId CHAR(36),
    ActionType VARCHAR(50) NOT NULL,
    EntityType VARCHAR(50) NOT NULL,
    EntityId CHAR(36),
    ActionTime DATETIME DEFAULT CURRENT_TIMESTAMP,
    IpAddress VARCHAR(45),
    UserAgent TEXT,
    RequestMethod VARCHAR(10),
    RequestPath VARCHAR(255),
    ChangesMade TEXT,
    StatusCode INT,
    IsDeleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 25. Comments
CREATE TABLE IF NOT EXISTS Comments (
    Id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    TaskId CHAR(36) NOT NULL,
    UserId CHAR(36),
    Content TEXT NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ParentCommentId CHAR(36),
    IsEdited BOOLEAN DEFAULT FALSE,
    Mentions JSON,
    IsDeleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (TaskId) REFERENCES Tasks(Id) ON DELETE CASCADE,
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE SET NULL,
    FOREIGN KEY (ParentCommentId) REFERENCES Comments(Id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 26. Teams
CREATE TABLE IF NOT EXISTS Teams (
    Id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    Name VARCHAR(100) NOT NULL,
    Description TEXT,
    LeadUserId CHAR(36),
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    IsDeleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (LeadUserId) REFERENCES Users(Id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 27. Team Members
CREATE TABLE IF NOT EXISTS TeamMembers (
    TeamId CHAR(36) NOT NULL,
    UserId CHAR(36) NOT NULL,
    Role VARCHAR(50),
    JoinedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    InvitedBy CHAR(36),
    IsDeleted BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (TeamId, UserId),
    FOREIGN KEY (TeamId) REFERENCES Teams(Id) ON DELETE CASCADE,
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    FOREIGN KEY (InvitedBy) REFERENCES Users(Id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 28. Project Teams
CREATE TABLE IF NOT EXISTS ProjectTeams (
    ProjectId CHAR(36) NOT NULL,
    TeamId CHAR(36) NOT NULL,
    AssignedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    AssignedBy CHAR(36),
    IsDeleted BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (ProjectId, TeamId),
    FOREIGN KEY (ProjectId) REFERENCES Projects(Id) ON DELETE CASCADE,
    FOREIGN KEY (TeamId) REFERENCES Teams(Id) ON DELETE CASCADE,
    FOREIGN KEY (AssignedBy) REFERENCES Users(Id) ON DELETE SET NULL
) ENGINE=InnoDB;
