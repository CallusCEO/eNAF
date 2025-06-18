'use client';

import styles from "@/styles/Main.module.css";
import { Text } from "./ui/luxe/text";
import { ArrowDown } from "lucide-react";
import { Email } from "@deemlol/next-icons";
import { useState, useRef } from "react";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import { div } from "motion/react-client";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export default function Main() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [method, setMethod] = useState<string | null>("txt");

  const [email, setEmail] = useState<string | string[]>("");

  return (
    <div className={styles.container}>
        <Text variant="generate-effect" className={styles.title}>Insert a mail</Text>
        <Text variant="generate-effect" className={styles.titleSpecial}>Get a SIRET/NAF</Text>
        <Text variant="shine" className={styles.subTitle}>In just one click</Text>

        <ArrowDown
            className={styles.arrowDown}
            size={24}
            color={'#666'}
        />


        <div className={styles.productContainer}>
            <div className={styles.productTitleContainer}>
                <Text variant="generate-effect" className={styles.productTitle}>Drop your mails</Text>
                <Email size={24} color={'var(--foreground)'} className={styles.productTitleIcon}/>
            </div>

            <div className={styles.productBox}>
                <div className={styles.productHeader}>
                    <Text variant="generate-effect" className={styles.productTitleHeader}>Choose a method</Text>
                    <Select defaultValue={method ?? "txt"} onValueChange={(v) => setMethod(v)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select a method" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Methods</SelectLabel>
                                <SelectItem value="pdf">{"pdf (beta)"}</SelectItem>
                                <SelectItem value="txt">txt</SelectItem>
                                <SelectItem value="manual">Manually</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>

                <div
                    className={styles.productBody}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragActive(true);
                    }}
                    onDragLeave={() => setIsDragActive(false)}
                    onDrop={(e) => {
                        e.preventDefault();
                        setIsDragActive(false);
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                            setSelectedFile(e.dataTransfer.files[0]);
                        }
                    }}
                    style={isDragActive ? { backgroundColor: "rgba(98, 176, 255, 0.1)", borderColor: "#62b0ff" } : undefined}
                >
                    <input
                        type="file"
                        accept=".pdf,.txt"
                        ref={fileInputRef}
                        onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                                setSelectedFile(e.target.files[0]);
                            }
                        }}
                        style={{ display: 'none' }}
                    />
                    <Text variant="generate-effect" className={styles.productTextBody}>
                        {method === "manual" ? "Type an email" : "Drag and drop your file."}
                    </Text>
                    {method !== "manual" ?
                    
                    (<button
                        onClick={() => fileInputRef.current?.click()}
                        className={styles.productButton}
                    >
                        Select {method}
                    </button>) : 
                    
                    (<div className={styles.productBodyInputContainer}>
                        <Input type="email" placeholder="exemple@gmail.com" />
                        <Button type="submit" variant="outline" className={styles.productButtonEnter}>
                        Enter
                        </Button>
                    </div>)

                    
                    
                    }
                    
                </div>
            </div>
        </div>






        {/* Additional details */}
        

        <div className={styles.lightOne}></div>
        <div className={styles.lightTwo}></div>
        <div className={styles.lightThree}></div>
        <div className={styles.lightFour}></div>
        <div className={styles.lightFive}></div>
    </div>
  );
}
