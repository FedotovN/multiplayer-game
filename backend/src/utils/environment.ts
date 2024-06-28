import dotenv from 'dotenv';
import path from 'path';
import url from "url";
import EnvironmentVariables from "../types/EnvironmentVariables";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default function environment(): EnvironmentVariables {
    const { parsed } = dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });
    return parsed as unknown as EnvironmentVariables;
}
