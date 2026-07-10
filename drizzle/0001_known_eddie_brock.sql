CREATE TABLE `interviewQA` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`questionNumber` int NOT NULL,
	`question` text NOT NULL,
	`userAnswer` longtext,
	`feedback` text,
	`score` decimal(3,1),
	`improvementTips` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `interviewQA_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `interviewSessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`resumeId` int,
	`jobRole` varchar(255) NOT NULL,
	`jobDescription` text,
	`status` enum('in_progress','completed','abandoned') NOT NULL DEFAULT 'in_progress',
	`totalQuestions` int NOT NULL DEFAULT 6,
	`questionsAnswered` int NOT NULL DEFAULT 0,
	`overallScore` decimal(3,1),
	`durationSeconds` int,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `interviewSessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `resumes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileKey` varchar(255) NOT NULL,
	`fileUrl` text NOT NULL,
	`mimeType` varchar(100) NOT NULL,
	`fileSize` int NOT NULL,
	`parsedContent` longtext,
	`analysis` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `resumes_id` PRIMARY KEY(`id`)
);
