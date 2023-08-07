import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useState, useEffect } from "react";
import type { BasicProfile } from "@datamodels/identity-profile-basic";

import ceramicLogo from "../public/ceramic.png";
import { useCeramicContext } from "../context";
import { authenticateCeramic } from "../utils";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  const clients = useCeramicContext();
  const { ceramic, composeClient } = clients;
  const [profile, setProfile] = useState<BasicProfile | undefined>();
  const [loading, setLoading] = useState<boolean>(false);
  const [recipient, setRecipient] = useState("");
  const [mult, setMult] = useState("");
  const [num, setNum] = useState("");
  const [context, setContext] = useState("");
  let [power, setPower] = useState("⬇️ Select a Watt Category ⬇️");
  const [res, setRes] = useState("");

  let powers = [
    { label: "VWATT", value: "VWATT" },
    { label: "SWATT", value: "SWATT" },
    { label: "CWATT", value: "CWATT" },
    { label: "NWATT", value: "NWATT" },
    { label: "XWATT", value: "XWATT" },
    { label: "LWATT", value: "LWATT" },
    { label: "PWATT", value: "PWATT" },
  ];

  let handleChange = (e) => {
    setPower(e.target.value);
  };

  const handleLogin = async () => {
    await authenticateCeramic(ceramic, composeClient);
    await getProfile();
  };

  const getProfile = async () => {
    setLoading(true);
    if (ceramic.did !== undefined) {
      const profile = await composeClient.executeQuery(`
        query {
          viewer {
            basicProfile {
              id
              name
              description
              gender
              emoji
            }
          }
        }
      `);

      setProfile(profile?.data?.viewer?.basicProfile);
      setLoading(false);
    }
  };

  const createPower = async () => {
    if (ceramic.did !== undefined) {
      const item = await composeClient.executeQuery(`
      mutation {
        createPowerUp(
          input: {
            content: {
              recipient: "${recipient}"
              templateID: {
                wattType: ${power}
                multiplier: ${Number(mult)}
              }
              value: ${Number(num)}
              context: "${context}"
            }
          }
        ) {
          document {
            author{
              id
            }
           recipient{
            id
          }
            templateID{
              wattType
              multiplier
            }
            value
            context
          }
          
        }
      }
      `);
      console.log(item);
      setRes(JSON.stringify(item));
      setLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("did")) {
      handleLogin();
    }
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create ceramic app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {profile === undefined && ceramic.did === undefined ? (
          <button
            onClick={() => {
              handleLogin();
            }}
          >
            Login
          </button>
        ) : (
          <>
            <div className={styles.form}>
              <select onChange={handleChange}>
                <option value="⬇️ Select a Watt Category ⬇️">
                  {" "}
                  -- Select a watt category --{" "}
                </option>
                {/* Mapping through each fruit object in our fruits array
          and returning an option element with the appropriate attributes / values.
         */}
                {powers.map((power) => (
                  <option key={powers.indexOf(power)} value={power.value}>
                    {power.label}
                  </option>
                ))}
              </select>
              <div className={styles.formGroup}>
                <label>
                  Recipient <br></br>
                  <small>
                    (for example:
                    `did:key:z6MkimxmNzE8Zkqnmu4r8Hd35o15X6k8ZALJQv3fdzfh1dB6`)
                  </small>
                </label>
                <input
                  type="text"
                  defaultValue={""}
                  onChange={(e) => {
                    setRecipient(e.target.value);
                  }}
                />
                <label>Multiplier</label>
                <input
                  type="text"
                  defaultValue={""}
                  onChange={(e) => {
                    setMult(e.target.value);
                  }}
                />
                <label>Value 0-1</label>
                <input
                  type="text"
                  defaultValue={""}
                  onChange={(e) => {
                    setNum(e.target.value);
                  }}
                />
                <label>Context</label>
                <input
                  type="text"
                  defaultValue={""}
                  onChange={(e) => {
                    setContext(e.target.value);
                  }}
                />
              </div>
              <div className={styles.buttonContainer}>
                <button
                  onClick={() => {
                    createPower();
                  }}
                >
                  {loading ? "Loading..." : "Create PowerUP"}
                </button>
              </div>
            </div>
            <br></br>
            <label>Result </label>
            <textarea
              style={{ height: "20rem", width: "50rem", padding: "1rem" }}
              value={res}
              onChange={(e) => {
                setRes(e.target.value);
              }}
            />
          </>
        )}
      </main>
    </div>
  );
};

export default Home;
