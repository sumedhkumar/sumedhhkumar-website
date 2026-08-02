import { appConfig } from "./src/lib/config";

console.log("Admin BCC Emails loaded from config:");
console.log(appConfig.adminBccEmails);

console.log("If this were a real email, the 'bcc' field would be set to:");
console.log(appConfig.adminBccEmails);
