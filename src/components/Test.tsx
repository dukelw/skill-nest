import {
  Roboto,
  Lora,
  Poppins,
  Inter,
  Playfair_Display,
} from "next/font/google";

export const roboto = Roboto({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-roboto",
});
export const lora = Lora({ subsets: ["latin"], weight: "400" });
export const poppins = Poppins({ subsets: ["latin"], weight: "400" });
export const inter = Inter({ subsets: ["latin"], weight: "400" });
export const playfair = Playfair_Display({ subsets: ["latin"], weight: "400" });

function Test() {
  return (
    <div className={`p-10 space-y-6 ${roboto.variable}`}>
      <h1 className="font-roboto">This is Roboto</h1>
      <h1 className={lora.className}>This is Lora</h1>
      <h1 className={poppins.className}>This is Poppins</h1>
      <h1 className={inter.className}>This is Inter</h1>
      <h1 className={playfair.className}>This is Playfair Display</h1>
    </div>
  );
}

export default Test;
