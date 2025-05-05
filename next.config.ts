import { NextConfig } from "next";
import i18n from "./next-i18next.config";
import withFlowbiteReact from "flowbite-react/plugin/nextjs";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  i18n,
};

export default withFlowbiteReact(nextConfig);