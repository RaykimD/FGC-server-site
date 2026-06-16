import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 휴대폰(네트워크) 접속 허용 설정
  allowedDevOrigins: ["192.168.219.194"],
};

export default nextConfig;