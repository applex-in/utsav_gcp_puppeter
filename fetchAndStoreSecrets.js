const { SecretManagerServiceClient } = require("@google-cloud/secret-manager");
const fs = require("fs");
const path = require("path");
const environment = require("./configurations/environment.js");

const projectId = "pujo2020-16b1b"; // Replace with your Google Cloud project ID
const outputFilePath = path.resolve("./.env");
const client = new SecretManagerServiceClient();

async function fetchAndStoreSecrets() {
  console.log("Starting fetchAndStoreSecrets...");
  console.log("Environment:", environment.ENVIRONMENT);
  console.log("process.env.ENVIRONMENT:", process.env.ENVIRONMENT);

  // Validate environment
  const validEnvironments = ["DEVELOPMENT", "UAT", "PRODUCTION"];
  if (!validEnvironments.includes(environment.ENVIRONMENT)) {
    throw new Error(`Invalid ENVIRONMENT value: ${environment.ENVIRONMENT}. Must be one of ${validEnvironments.join(", ")}`);
  }

  try {
    // Determine secret name based on environment
    let secretName;
    if (environment.ENVIRONMENT === "UAT") {
      secretName = `projects/${projectId}/secrets/utsav-backend-uat-secrets/versions/latest`;
    } else if (environment.ENVIRONMENT === "PRODUCTION") {
      secretName = `projects/${projectId}/secrets/utsav-backend-prod-secrets/versions/latest`;
    } else {
      secretName = `projects/${projectId}/secrets/utsav-backend-dev-secrets/versions/latest`;
    }
    console.log(`Using secret name: ${secretName}`);

    // Fetch secret from Google Cloud Secret Manager
    console.log(`Fetching secret ${secretName}...`);
    const [version] = await client.accessSecretVersion({
      name: secretName,
    });

    const secretString = version.payload.data.toString();
    if (!secretString) {
      throw new Error("Secret payload is empty or undefined.");
    }
    console.log("Secret retrieved successfully.");

    // Parse secret JSON
    let secretJson;
    try {
      secretJson = JSON.parse(secretString);
      console.log("Secret JSON parsed successfully.");
    } catch (parseError) {
      throw new Error(`Failed to parse secret payload as JSON: ${parseError.message}`);
    }

    // Convert secrets to .env format
    const envData = Object.entries(secretJson)
      .map(([key, value]) => `${key}=${value}`)
      .join("\n");

    // Write secrets to .env file
    console.log(`Writing secrets to ${outputFilePath}...`);
    fs.writeFileSync(outputFilePath, envData);
    console.log(`Secrets written to ${outputFilePath}`);
  } catch (error) {
    console.error("Error in fetchAndStoreSecrets:", error.message);
    throw error;
  }
}

console.log("Checking environment for secrets fetching...");
console.log("Raw ENVIRONMENT value:", environment.ENVIRONMENT);
console.log("Fetching secrets...");
fetchAndStoreSecrets().catch((error) => {
  console.error("fetchAndStoreSecrets failed:", error);
  if (environment.ENVIRONMENT === "DEVELOPMENT") {
    console.log(`Creating dummy .env file at ${outputFilePath} for DEVELOPMENT...`);
    fs.writeFileSync(outputFilePath, "# Dummy .env for DEVELOPMENT\nDUMMY_KEY=dummy_value");
    console.log("Dummy .env file created.");
    process.exit(0);
  }
  process.exit(1);
});