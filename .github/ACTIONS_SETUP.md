# GitHub Actions Setup Guide

This document provides instructions for setting up the required secrets and configuration for GitHub Actions workflows in this repository.

## Required Secrets

The following secrets need to be configured in your GitHub repository settings to enable all CI/CD workflows:

### 1. SONAR_TOKEN (Required for SonarCloud Scan)

SonarCloud provides code quality analysis and technical debt tracking.

**Setup Steps:**
1. Go to [SonarCloud](https://sonarcloud.io/) and sign in with your GitHub account
2. Navigate to your account security settings: https://sonarcloud.io/account/security
3. Generate a new token with a descriptive name (e.g., "fix-augment-github-actions")
4. Copy the generated token
5. In GitHub, go to: Repository Settings → Secrets and variables → Actions → New repository secret
6. Name: `SONAR_TOKEN`
7. Value: Paste the token from SonarCloud
8. Click "Add secret"

**Workflow:** Used in `.github/workflows/ci.yml` (code-quality job)

**Notes:**
- The workflow leverages `SonarSource/sonarqube-scan-action@v5.0.0` with `SONAR_HOST_URL` preset to `https://sonarcloud.io`
- If the `SONAR_TOKEN` secret is not configured, the workflow emits a warning and skips the scan to avoid false negatives

### 2. SNYK_TOKEN (Required for Snyk Security Scan)

Snyk scans for security vulnerabilities in dependencies.

**Setup Steps:**
1. Create a free Snyk account at https://snyk.io/
2. Sign in and navigate to Account Settings: https://app.snyk.io/account
3. Go to the "API Token" section
4. Click "click to show" to reveal your API token (or generate a new one)
5. Copy the token
6. In GitHub, go to: Repository Settings → Secrets and variables → Actions → New repository secret
7. Name: `SNYK_TOKEN`
8. Value: Paste your Snyk API token
9. Click "Add secret"

**Workflow:** Used in `.github/workflows/ci.yml` (security job)

**Notes:**
- The workflow uses `snyk/actions/node@v4` with the command `snyk test`
- When `SNYK_TOKEN` is not configured, the job posts a warning and skips the scan so other checks can complete

### 3. VSCE_PAT (Required for VS Code Marketplace Publishing)

Used to publish the extension to the Visual Studio Code Marketplace.

**Setup Steps:**
1. Go to https://dev.azure.com/
2. Create a Personal Access Token with Marketplace publishing permissions
3. In GitHub, go to: Repository Settings → Secrets and variables → Actions → New repository secret
4. Name: `VSCE_PAT`
5. Value: Paste your Azure DevOps PAT
6. Click "Add secret"

**Workflow:** Used in `.github/workflows/release.yml`

### 4. OVSX_PAT (Required for Open VSX Registry Publishing)

Used to publish the extension to the Open VSX Registry.

**Setup Steps:**
1. Go to https://open-vsx.org/
2. Sign in and create an access token
3. In GitHub, go to: Repository Settings → Secrets and variables → Actions → New repository secret
4. Name: `OVSX_PAT`
5. Value: Paste your Open VSX token
6. Click "Add secret"

**Workflow:** Used in `.github/workflows/release.yml`

## Workflow Configuration

### Test Workflow (ubuntu-latest)

The test workflow runs on multiple operating systems including ubuntu-latest. For Linux systems, VS Code extension tests require a display server. The workflow automatically sets up Xvfb (X virtual framebuffer) to provide a virtual display for running tests in headless CI environments.

**Technical Details:**
- Xvfb is automatically installed on ubuntu-latest runners
- Tests are executed with `xvfb-run -a npm test`
- No additional configuration is required from your end

### SonarCloud Configuration

The SonarCloud scan is configured via `sonar-project.properties` in the root directory. Key settings:
- Project Key: `fix-augment`
- Organization: `mrxploislite`
- Sources: `src/`
- Tests: `tests/`
- Coverage reports: Automatically picked up from `coverage/lcov.info`

## Troubleshooting

### SonarCloud Scan Fails
- Verify that `SONAR_TOKEN` is correctly set in repository secrets
- Ensure your SonarCloud organization and project key match the values in `sonar-project.properties`
- Check that the token has not expired

### Snyk Security Scan Fails (401 Unauthorized)
- Verify that `SNYK_TOKEN` is correctly set in repository secrets
- Ensure your Snyk account is active
- Try regenerating the Snyk API token

### VS Code Tests Fail on ubuntu-latest
- If you see "Missing X server or $DISPLAY" errors, the Xvfb setup may have failed
- Check the workflow logs for Xvfb installation errors
- The workflow should automatically handle this - if it persists, file an issue

## Optional Secrets

- `CODECOV_TOKEN`: For enhanced Codecov integration (optional, public repos work without it)

## Getting Help

If you encounter issues with GitHub Actions:
1. Check the workflow run logs in the Actions tab
2. Verify all required secrets are configured
3. Review the error messages for specific guidance
4. Open an issue in the repository with the error details
