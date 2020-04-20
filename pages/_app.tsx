import { AppProps } from "next/app";
import "tailwindcss/dist/base.css";

const App = ({ Component, pageProps }: AppProps) => {
  return <Component {...pageProps} />;
};

export default App;
