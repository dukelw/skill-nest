import { NextConfig } from "next";
import { nextI18nConfig } from "./next-i18next.config";
import withFlowbiteReact from "flowbite-react/plugin/nextjs";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn-media.sforum.vn",
        pathname: "/storage/app/media/**",
      },
    ],
  },
  reactStrictMode: true,
  i18n: nextI18nConfig.i18n,
};

export default withFlowbiteReact(nextConfig);
