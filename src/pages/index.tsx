import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { Button, Center } from "@chakra-ui/react";
import {
  installAppByName,
  getAllAppInstalled,
  getDeviceInfo
} from "@ledgerhq/nano-app-web-installer-lib";
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import { useCallback, useEffect, useMemo, useState } from "react";
import Transport from "@ledgerhq/hw-transport";

type DeviceInfo = Awaited<ReturnType<typeof getDeviceInfo>>;
type InstalledApps = Awaited<ReturnType<typeof getAllAppInstalled>>;

export default function Home() {
  const [ledgerTransport, setLedgerTransport] = useState<Transport>();
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>();
  const [installedApps, setInstalledApps] = useState<InstalledApps>();
  const [starknetApp, setStarknetApp] = useState<InstalledApps[0]>();
  const [waiting, setWaiting] = useState(false);

  const appName = "staRknet";

  // starknet app is only availble in staging, provider = 4
  const provider = 4;

  // set to true to uninstall app
  // const isDelete = false

  const connectToLedger = async () => {
    const transport = await TransportWebUSB.create();
    setLedgerTransport(transport);
    const deviceInfo = await getDeviceInfo(transport);
    console.log(
      "🚀 ~ file: index.tsx:36 ~ connectToLedger ~ deviceInfo:",
      deviceInfo
    );

    setDeviceInfo(deviceInfo);

    await getInstalledApps(transport);
  };

  const getInstalledApps = useCallback(
    async (transport: Transport) => {
      setWaiting(true);
      const allInstalledApps = await getAllAppInstalled(transport);
      console.log(
        "🚀 ~ file: home.tsx:58 ~ connectToLedger ~ installedApps:",
        installedApps
      );

      setInstalledApps(allInstalledApps);
      setWaiting(false);
    },
    [installedApps]
  );

  const getStarknetApp = useCallback((installedApps?: InstalledApps) => {
    const snApp = installedApps?.find(app => app.name === appName);
    setStarknetApp(snApp);
    return snApp;
  }, []);

  useEffect(() => {
    getStarknetApp(installedApps);
  }, [getStarknetApp, installedApps]);

  const hasStarknetApp = useMemo(() => {
    return !!starknetApp;
  }, [starknetApp]);

  const installStarknetApp = useCallback(
    async (type: "install" | "uninstall") => {
      if (ledgerTransport && deviceInfo) {
        setWaiting(true);
        switch (ledgerTransport.deviceModel?.id) {
          case "nanoX":
            if (deviceInfo.version === "2.1.0") {
              await installAppByName(
                appName,
                ledgerTransport,
                type === "uninstall",
                provider
              );
            } else {
              throw new Error("Device is not up to date");
            }
            break;
          case "nanoSP":
            if (deviceInfo.version === "1.1.0") {
              await installAppByName(
                appName,
                ledgerTransport,
                type === "uninstall",
                provider
              );
            } else {
              throw new Error("Device is not up to date");
            }
            break;
          case "nanoS":
            if (deviceInfo.version === "2.1.0") {
              await installAppByName(
                appName,
                ledgerTransport,
                type === "uninstall",
                provider
              );
            } else {
              throw new Error("Device is not up to date");
            }
            break;
          default:
            throw new Error("Device not recognized");
        }
        setWaiting(false);
      } else {
        throw new Error("No transport");
      }
    },
    [deviceInfo, ledgerTransport]
  );

  useEffect(() => {
    console.log("ledgerTransport", ledgerTransport);
    console.log("deviceInfo", deviceInfo);
    console.log("installedApps", installedApps);
  }, [deviceInfo, installedApps, ledgerTransport]);

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <Center flexDirection={"column"} gap="5" h="full">
          <h1>Home</h1>
          <p>Welcome to the home page!</p>
          {ledgerTransport ? (
            <p>Connected to your {ledgerTransport.deviceModel?.productName}</p>
          ) : (
            <Button onClick={connectToLedger}>Connect to Ledger</Button>
          )}
          {ledgerTransport && !hasStarknetApp && !waiting && (
            <Button onClick={() => installStarknetApp("install")}>
              Install Starknet
            </Button>
          )}
          {ledgerTransport && hasStarknetApp && !waiting && (
            <>
              <p>Starknet App is installed on your device</p>
              <Button onClick={() => installStarknetApp("uninstall")}>
                Uninstall
              </Button>
            </>
          )}
          {waiting && <p>Waiting for an action on Ledger...</p>}
        </Center>
      </main>
    </>
  );
}
