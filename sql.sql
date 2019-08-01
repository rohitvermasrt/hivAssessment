USE [hivmgddev]
GO

/****** Object: Table [dbo].[SubjectiveAssessment] Script Date: 7/30/2019 2:55:43 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[SubjectiveAssessment] (
    [Id]              INT            IDENTITY (1, 1) NOT NULL,
    [userId]          INT            NULL,
    [deviceId]        NVARCHAR (MAX) NOT NULL,
    [patientId]       NVARCHAR (MAX) NOT NULL,
    [startTime]       NVARCHAR (25)  NOT NULL,
    [endTime]         NVARCHAR (25)  NOT NULL,
    [risk]            NVARCHAR (MAX) NOT NULL,
    [jsonVersion]     NVARCHAR (MAX) NOT NULL,
    [riskValue]       FLOAT (53)     NOT NULL,
    [latitude]        NVARCHAR (30)  NOT NULL,
    [longitude]       NVARCHAR (30)  NOT NULL,
    [devicetimestamp] DATETIME       NOT NULL,
    [timestamp]       ROWVERSION     NOT NULL
);
GO;



