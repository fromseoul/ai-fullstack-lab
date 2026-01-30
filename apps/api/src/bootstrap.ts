import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 환경 변수를 먼저 로드
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// 그 다음 메인 앱 실행
import("./index.js");
