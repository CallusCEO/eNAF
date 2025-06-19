'use client';

import styles from "@/styles/Main.module.css";
import { Text } from "./ui/luxe/text";
import { ArrowDown } from "lucide-react";
import { Email, Flag, Info } from "@deemlol/next-icons";
import { useState, useRef, useEffect } from "react";
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
import { checkEmail } from "@/lib/checkEmail";
import { Loader2Icon } from "lucide-react"
import { handleStringLen } from "@/lib/handleStringLen";
import { processTextToEmail } from "@/lib/processTextToEmail";
import { sliceEmail } from "@/lib/sliceEmail";

export default function Main() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [method, setMethod] = useState<string | null>("txt");

  const [email, setEmail] = useState<string>("");

  const [textToProcess, setTextToProcess] = useState<string>("");

  //state for animation
  const [isProcessing, setIsProcessing] = useState(false);

  // Call the API with enhanced error handling
  const searchCompany = async (companyName: string) => {
    try {
        console.log(`Fetching data for company: ${companyName}`);
        const response = await fetch(`/api/insee?companyName=${encodeURIComponent(companyName)}`);
        
        // Get the response text first to handle both JSON and text responses
        const responseText = await response.text();
        let responseData;
        
        try {
            responseData = responseText ? JSON.parse(responseText) : {};
        } catch (e) {
            console.error('Failed to parse response as JSON:', responseText);
            throw new Error(`Invalid response format: ${responseText.substring(0, 100)}...`);
        }
        
        if (!response.ok) {
            console.error('API Error:', {
                status: response.status,
                statusText: response.statusText,
                url: response.url,
                response: responseData
            });
            
            const errorMessage = responseData?.error || responseData?.message || 'Failed to fetch company data';
            const errorDetails = responseData?.details ? ` (${responseData.details})` : '';
            throw new Error(`${errorMessage}${errorDetails}`);
        }
        
        console.log('Company data received:', responseData);
        return responseData;
        
    } catch (error) {
        console.error('Error in searchCompany:', {
            error,
            message: error instanceof Error ? error.message : 'Unknown error',
            companyName
        });
        throw error; // Re-throw to allow error handling in the calling code
    }
  };

  const readFile = async () => {

    try {
        // check if email was written manually and process it
        if (checkEmail(email)) {
            setIsProcessing(true);
            return email
        }

        // read file
        if (selectedFile !== null) {
            setIsProcessing(true);
            
            if (selectedFile.name.endsWith('.pdf')) {
                // const pdf = require('pdf-parse');
                // const data = await pdf(selectedFile);
                // setTextToProcess(data.text);
            } else {
                const fileContent = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target?.result as string);
                    reader.onerror = () => reject(reader.error);
                    reader.readAsText(selectedFile!);
                });

                // setTextToProcess(fileContent);
                const mailsArr = processTextToEmail(fileContent);
                const mailsArrProcessed = mailsArr.map((mail) => sliceEmail(mail));
                console.log(mailsArrProcessed);
                searchCompany('UNITEL');
            }
        }
    } catch (err) {
        console.log("An error occured please try again.")
    }
  }

  const buttonHandlingUI = () => {

    if (isProcessing) {
        return (
        <Button size="sm" className="mt-2" disabled>
            <Loader2Icon className="animate-spin" />
            Processing...
        </Button>
        )
    }

    if (selectedFile !== null) {
        return (
        <button
            onClick={() => readFile()}
            className={styles.productButton}
        >
            Process
        </button>
        )
    }

    if (method === "manual") {
        return (
            <>
            <div className={styles.productBodyInputContainer}>
                <Input type="email" placeholder="exemple@gmail.com" onChange={(e) => setEmail(e.target.value)} />
                <Button type="submit" variant="outline" className={styles.productButtonEnter} onClick={() => readFile()}>
                Enter
                </Button>
            </div>
            {email !== '' &&
					(checkEmail(email) ? (
						<div className={styles.infoMessage}>
							<Flag size={16} color={'#66ff66'} />
							<Text variant='generate-effect' className={styles.validEmail}>
								Valid Email
							</Text>
						</div>
					) : (
						<div className={styles.infoMessage}>
							<Info size={16} color={'#ff6666'} />
							<Text variant='generate-effect' className={styles.invalidEmail}>
								Invalid Email
							</Text>
						</div>
					))
            }
            </>
        )
    }

    

    return (
        <button
            onClick={() => fileInputRef.current?.click()}
            className={styles.productButton}
        >
            Select {method}
        </button>
    )
  }
  
  const textHandlingUI = () => {

    if (isProcessing) {
        return <Text variant='shine' className={styles.productTextBody + ' ' + styles.productTitleIcon}>Your {checkEmail(email) ? "email" : "file"} is being processed...</Text>
    }

    if (selectedFile !== null) {
        // display the name of the file
        return <Text variant="generate-effect" className={styles.productTextBody}>{handleStringLen(selectedFile.name.split('.').slice(0, -1).join('.') ?? '', 0, 20) + '.' + selectedFile.name.split('.').pop()}</Text>
    }

    if (method === "manual") {
        return <Text variant="generate-effect" className={styles.productTextBody}>Type an email.</Text>
    }

    return <Text variant="generate-effect" className={styles.productTextBody}>Drag and drop your file.</Text>
  }

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
                                <SelectItem value="pdf">{"pdf (coming soon)"}</SelectItem>
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
                            setSelectedFile(e.dataTransfer.files[0]);                        }
                    }}
                    style={isDragActive ? { backgroundColor: "rgba(98, 176, 255, 0.1)", borderColor: "#62b0ff" } : undefined}
                >
                    <input
                        type="file"
                        accept={method === "pdf" ? ".pdf" : ".txt"}
                        ref={fileInputRef}
                        onChange={(e) => {
                            if (e.target.files && e.target.files[0] && (e.target.files[0].type === "application/pdf" || e.target.files[0].type === "text/plain")) {
                                setSelectedFile(e.target.files[0]);
                            }
                        }}
                        style={{ display: 'none' }}
                    />
                    {textHandlingUI()}
                    {buttonHandlingUI()}
                    
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
