'use client';

import styles from '@/styles/Main.module.css';
import { Text } from './ui/luxe/text';
import {
	ArrowDown,
	ChevronsUpDown,
	DownloadIcon,
	Shuffle,
	SortAsc,
	SortDesc,
} from 'lucide-react';
import {
	Email,
	File,
	Flag,
	Terminal,
	Info,
	XCircle,
} from '@deemlol/next-icons';
import { useState, useRef } from 'react';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { checkEmail } from '@/lib/checkEmail';
import { Loader2Icon } from 'lucide-react';
import { handleStringLen } from '@/lib/handleStringLen';
import { processTextToEmail } from '@/lib/processTextToEmail';
import { sliceEmail } from '@/lib/sliceEmail';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { selectData } from '@/lib/selectData';
import { downloadFile } from '@/lib/downloadFile';
import { DataType } from '@/types/DataType';
import { toProperName } from '@/lib/toProperName';
import { sortData } from '@/lib/sortData';
import { SortCriteria } from '@/types/sortCriteria';

export default function Main() {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [isDragActive, setIsDragActive] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [method, setMethod] = useState<string | null>('txt');

	const [email, setEmail] = useState<string>('');
	const [dataMails, setDataMails] = useState<DataType[]>([]);

	// tracks calls
	const [calls, setCalls] = useState(0);
	const callsRef = useRef(0);

	//state for animation
	const [isProcessing, setIsProcessing] = useState(false);
	const [message, setMessage] = useState<string | null>('');
	const [isOpen, setIsOpen] = useState(true);

	// invalid mail company
	const invalidMailCompany: string[] = [
		'gmail',
		'yahoo',
		'hotmail',
		'outlook',
	];

	// sorting method
	const [sortingMethod, setSortingMethod] = useState<SortCriteria>('name');
	const [sortingOrder, setSortingOrder] = useState<'asc' | 'desc'>('asc');

	// increment the calls
	const incrementCalls = (n: number) => {
		callsRef.current += n;
		setCalls(callsRef.current);
	};

	// wait for 60s and resets calls
	const resetCalls = async (secondChance: boolean = false) => {
		setMessage('57s before next batch');
		let seconds = 56;
		const intervalId = setInterval(() => {
			setMessage(`${seconds--}s before next batch`);
		}, 1000);
		await new Promise((resolve) =>
			setTimeout(() => {
				clearInterval(intervalId);
				resolve(null);
			}, 57000)
		);
		callsRef.current = 0;
		setCalls(0);

		// optional
		if (secondChance) {
			setMessage('Searching again...');
		}
	};

	// Call the API with enhanced error handling
	const searchCompany = async (companyName: string) => {
		try {
			incrementCalls(1);
			const response = await fetch(
				`/api/insee?companyName=${encodeURIComponent(companyName)}`
			);

			// Get the response text first to handle both JSON and text responses
			const responseText = await response.text();
			let responseData;

			try {
				responseData = responseText ? JSON.parse(responseText) : {};
			} catch (err) {
				console.error(
					'Failed to parse response as JSON:',
					responseText + ' ' + err
				);
				setMessage('Failed task, try later.');
				throw new Error(
					`Invalid response format: ${responseText.substring(
						0,
						100
					)}...`
				);
			}

			if (!response.ok) {
				console.error('API Error:', {
					status: response.status,
					statusText: response.statusText,
					url: response.url,
					response: responseData,
				});

				const errorMessage =
					responseData?.error ||
					responseData?.message ||
					'Failed to fetch company data';
				const errorDetails = responseData?.details
					? ` (${responseData.details})`
					: '';
				throw new Error(`${errorMessage}${errorDetails}`);
			}

			console.log('Company data received:', responseData);
			return responseData;
		} catch (error) {
			console.error('Error in searchCompany:', {
				error,
				message:
					error instanceof Error ? error.message : 'Unknown error',
				companyName,
			});
			throw error; // Re-throw to allow error handling in the calling code
		}
	};

	const processAllSecondChance = async (
		list: {
			name: string;
			domain: string;
			company: string;
		}[]
	) => {
		const dataMails = [];

		for (const mail of list) {
			let i = 0;
			let dataCurrSorted: DataType = {
				name: mail.name,
				company: mail.company,
				reliability: 'medium',
				denominationUniteLegale: '',
				siren: '',
				naf: '',
				siret: '',
			};
			setMessage(`Deep search for ${toProperName(mail.company)}...`);

			while (mail.company.length + i !== 0) {
				i--;
				// Always display 0 --> The starting value
				console.log(
					`i = ${i} and condition = ${
						mail.company.length + i !== 0
					} calls = `,
					callsRef.current
				);
				const dataCurr = await searchCompany(mail.company.slice(0, i));

				if (callsRef.current >= 30) {
					await resetCalls(true);
				}

				dataCurrSorted = selectData({
					name: mail.name,
					company: mail.company,
					reliability: 'medium',
					...dataCurr,
				});
				if (dataCurr?.header?.message !== 'not found') {
					break;
				}
			}
			dataMails.push(dataCurrSorted);
		}
		return dataMails;
	};

	const processAllMails = async (
		list: {
			name: string;
			domain: string;
			company: string;
		}[]
	) => {
		const dataMails: DataType[] = [];
		const secondChanceArr = [];
		for (const mail of list) {
			if (invalidMailCompany.includes(mail.company.toLowerCase())) {
				dataMails.push(
					selectData({
						name: mail.name,
						company: mail.company,
						reliability: 'low',
						etablissements: [
							{
								siret: '',
								siren: '',
								uniteLegale: {
									denominationUniteLegale: '',
									activitePrincipaleUniteLegale: '',
								},
							},
						],
					})
				);
			} else {
				setMessage(`Fetching data for ${toProperName(mail.company)}`);
				const dataCurr = await searchCompany(mail.company);
				// Always display 0 --> The starting value
				console.log(`Calls in processAllMails: `, callsRef.current);

				if (dataCurr?.header?.message === 'not found') {
					secondChanceArr.push(mail);
				} else {
					const dataCurrSorted = selectData({
						name: mail.name,
						company: mail.company,
						reliability: 'high',
						...dataCurr,
					});
					dataMails.push(dataCurrSorted);
				}
			}
		}
		return { dataMails, secondChanceArr };
	};

	const readFile = async () => {
		// clean all
		setDataMails([]);
		setMessage('');
		setEmail('');
		callsRef.current = 0;
		setCalls(0);

		console.log(calls);

		try {
			if (checkEmail(email)) {
				setIsProcessing(true);
				const { dataMails, secondChanceArr } = await processAllMails([
					sliceEmail(email),
				]);
				if (secondChanceArr.length > 0) {
					const secondRunData = await processAllSecondChance(
						secondChanceArr
					);
					dataMails.push(...secondRunData);
				}
				setIsProcessing(false);
				setCalls(0);
				setMessage('Task completed');
				setDataMails(dataMails);
				console.log('Companies processed:', dataMails);
			} else if (selectedFile !== null) {
				setIsProcessing(true);
				const fileContent = await new Promise<string>(
					(resolve, reject) => {
						const reader = new FileReader();
						reader.onload = (e) =>
							resolve(e.target?.result as string);
						reader.onerror = () => reject(reader.error);
						reader.readAsText(selectedFile!);
					}
				);

				const mailsArr = processTextToEmail(fileContent);
				const mailsArrCutToCompany = mailsArr.map((mail) =>
					sliceEmail(mail)
				);

				const data: DataType[] = [];
				const secondChanceArrGlobal: {
					name: string;
					domain: string;
					company: string;
				}[] = [];

				while (mailsArrCutToCompany.length > 0) {
					const mailsArrToProcess = mailsArrCutToCompany.splice(
						0,
						30
					);
					const { dataMails, secondChanceArr } =
						await processAllMails(mailsArrToProcess);

					data.push(...dataMails);
					secondChanceArrGlobal.push(...secondChanceArr);

					setDataMails([...data]); // updates UI

					if (callsRef.current >= 30) {
						await resetCalls();
					}
				}

				while (secondChanceArrGlobal.length > 0) {
					const mailsArrToProcess = secondChanceArrGlobal.splice(
						0,
						30
					);
					const secondRunData = await processAllSecondChance(
						mailsArrToProcess
					);
					data.push(...secondRunData);
					setDataMails([...data]);

					if (callsRef.current >= 30) {
						await resetCalls();
					}
				}

				setIsProcessing(false);
				setMessage('Task completed');
				setCalls(0);
				console.log('Companies processed:', data);
			}
		} catch (err) {
			setMessage('');
			setIsProcessing(false);
			console.error('An error occured please try again: ' + err);
		}
	};

	const buttonHandlingUI = () => {
		if (isProcessing) {
			return (
				<Button size='sm' className='mt-2' disabled>
					<Loader2Icon className='animate-spin' />
					Processing...
				</Button>
			);
		} else if (selectedFile !== null) {
			return (
				<button
					onClick={() => readFile()}
					className={styles.productButton}
				>
					Process
					<Terminal size={16} className='ml-2' />
				</button>
			);
		} else if (method === 'manual') {
			return (
				<>
					<div className={styles.productBodyInputContainer}>
						<Input
							type='email'
							placeholder='exemple@gmail.com'
							onChange={(e) => setEmail(e.target.value)}
						/>
						<Button
							type='submit'
							variant='outline'
							className={styles.productButtonEnter}
							onClick={() => readFile()}
						>
							Enter
						</Button>
					</div>
					{email !== '' &&
						(checkEmail(email) ? (
							<div className={styles.infoMessage}>
								<Flag size={16} color={'#66ff66'} />
								<Text
									variant='generate-effect'
									className={styles.validEmail}
								>
									Valid Email
								</Text>
							</div>
						) : (
							<div className={styles.infoMessage}>
								<Info size={16} color={'#ff6666'} />
								<Text
									variant='generate-effect'
									className={styles.invalidEmail}
								>
									Invalid Email
								</Text>
							</div>
						))}
				</>
			);
		}

		return (
			<button
				onClick={() => fileInputRef.current?.click()}
				className={styles.productButton}
			>
				<File size={16} className='mr-1' />
				Select {method}
			</button>
		);
	};

	const textHandlingUI = () => {
		if (isProcessing && !message) {
			return (
				<Text
					variant='shine'
					className={styles.productTextBodyProcessing}
				>
					Your {checkEmail(email) ? 'email' : 'file'} is being
					processed...
				</Text>
			);
		} else if (message) {
			return (
				<Text
					key={message} // This will force a re-mount when message changes
					variant='shine'
					className={styles.productTextBodyProcessing}
				>
					{message}
				</Text>
			);
		} else if (selectedFile !== null) {
			// display the name of the file
			return (
				<Text
					variant='generate-effect'
					className={styles.productTextBody}
				>
					{handleStringLen(
						selectedFile.name.split('.').slice(0, -1).join('.') ??
							'',
						0,
						20
					) +
						'.' +
						selectedFile.name.split('.').pop()}
				</Text>
			);
		} else if (method === 'manual') {
			return (
				<Text
					variant='generate-effect'
					className={styles.productTextBody}
				>
					Type an email.
				</Text>
			);
		}

		return (
			<Text variant='generate-effect' className={styles.productTextBody}>
				Drag and drop your file.
			</Text>
		);
	};

	const handleResetClick = () => {
		setMessage('');
		setSelectedFile(null);
		setEmail('');
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	const handleShuffleSort = () => {
		const sortTypes = [
			'reliability',
			'company',
			'name',
			'denominationUniteLegale',
		] as const;
		const currentIdx = sortTypes.indexOf(sortingMethod);
		const nextIdx = (currentIdx + 1) % sortTypes.length;
		setSortingMethod(sortTypes[nextIdx]);
	};

	const handleToggleOrder = () => {
		setSortingOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
	};

	return (
		<div className={styles.container}>
			<Text variant='generate-effect' className={styles.title}>
				Insert a mail
			</Text>
			<Text variant='generate-effect' className={styles.titleSpecial}>
				Get a SIRET/NAF
			</Text>
			<Text variant='shine' className={styles.subTitle}>
				In just one click
			</Text>

			<ArrowDown className={styles.arrowDown} size={24} color={'#666'} />

			<div className={styles.productContainer}>
				<div className={styles.productTitleContainer}>
					<Text
						variant='generate-effect'
						className={styles.productTitle}
					>
						Drop your mails
					</Text>
					<Email
						size={24}
						color={'var(--foreground)'}
						className={styles.productTitleIcon}
					/>
				</div>

				<div className={styles.productBox}>
					<div className={styles.productHeader}>
						<Text
							variant='generate-effect'
							className={styles.productTitleHeader}
						>
							Choose a method
						</Text>
						<Select
							defaultValue={method ?? 'txt'}
							onValueChange={(v) => setMethod(v)}
						>
							<SelectTrigger className='w-[180px] cursor-pointer'>
								<SelectValue placeholder='Select a method' />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									<SelectLabel>Methods</SelectLabel>
									{/* <SelectItem value="pdf">{"pdf (coming soon)"}</SelectItem> Security by design */}
									<SelectItem value='txt'>txt</SelectItem>
									<SelectItem value='manual'>
										Manually
									</SelectItem>
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
							if (
								e.dataTransfer.files &&
								e.dataTransfer.files[0]
							) {
								setSelectedFile(e.dataTransfer.files[0]);
							}
						}}
						style={
							isDragActive
								? {
										backgroundColor:
											'rgba(98, 176, 255, 0.1)',
										borderColor: '#62b0ff',
								  }
								: undefined
						}
					>
						<input
							type='file'
							accept={method === 'pdf' ? '.pdf' : '.txt'}
							ref={fileInputRef}
							onChange={(e) => {
								if (
									e.target.files &&
									e.target.files[0] &&
									(e.target.files[0].type ===
										'application/pdf' ||
										e.target.files[0].type === 'text/plain')
								) {
									setSelectedFile(e.target.files[0]);
									setEmail('');
								}
							}}
							style={{ display: 'none' }}
						/>
						{message === 'Task completed' ? (
							// table
							<>
								<Table className={styles.productTitleIcon}>
									<TableHeader>
										<TableRow>
											<TableHead className='w-[100px]'>
												First Name
											</TableHead>
											<TableHead className='w-[100px]'>
												Last Name
											</TableHead>
											<TableHead>Company</TableHead>
											<TableHead>Siren</TableHead>
											<TableHead>Siret</TableHead>
											<TableHead>Naf</TableHead>
											<TableHead>Found Company</TableHead>
											<TableHead>Reliability</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{sortData(
											dataMails,
											sortingMethod,
											sortingOrder
										).map((item: DataType, index) => (
											<TableRow key={index}>
												<TableCell className='font-medium'>
													{item.name.split(' ')[0]}
												</TableCell>
												<TableCell>
													{!item.name.split(' ')[1]
														? 'Not found'
														: item.name.split(
																' '
														  )[1]}
												</TableCell>
												<TableCell>
													{item.company === ''
														? 'Not found'
														: item.company}
												</TableCell>
												<TableCell>
													{item.siren === ''
														? 'Not found'
														: item.siren}
												</TableCell>
												<TableCell>
													{item.siret === ''
														? 'Not found'
														: item.siret}
												</TableCell>
												<TableCell>
													{item.naf === ''
														? 'Not found'
														: item.naf}
												</TableCell>
												<TableCell>
													{item.denominationUniteLegale ===
													''
														? 'Not found'
														: item.denominationUniteLegale}
												</TableCell>
												<TableCell
													className={
														item.reliability ===
														'high'
															? styles.cellGreen
															: item.reliability ===
															  'medium'
															? styles.cellYellow
															: styles.cellRed
													}
												>
													<p>{item.reliability}</p>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
								<div className={styles.toolsContainer}>
									<Tooltip>
										<TooltipTrigger asChild>
											<Button
												variant='ghost'
												size='icon'
												className='size-8 cursor-pointer rounded-full'
												onClick={handleResetClick}
											>
												<XCircle />
												<span className='sr-only'>
													Reset
												</span>
											</Button>
										</TooltipTrigger>
										<TooltipContent>
											<p>Reset</p>
										</TooltipContent>
									</Tooltip>
									<Tooltip>
										<TooltipTrigger asChild>
											<Button
												variant='ghost'
												size='icon'
												className='size-8 cursor-pointer rounded-full'
												onClick={handleShuffleSort}
											>
												<Shuffle />
												<span className='sr-only'>
													Shuffle
												</span>
											</Button>
										</TooltipTrigger>
										<TooltipContent>
											<p>
												Actually by{' '}
												{sortingMethod ===
												'denominationUniteLegale'
													? 'Found Company'
													: sortingMethod
															.charAt(0)
															.toUpperCase() +
													  sortingMethod.slice(1)}
											</p>
										</TooltipContent>
									</Tooltip>
									<Tooltip>
										<TooltipTrigger asChild>
											<Button
												variant='ghost'
												size='icon'
												className='size-8 cursor-pointer rounded-full'
												onClick={handleToggleOrder}
											>
												{sortingOrder === 'asc' ? (
													<SortAsc />
												) : (
													<SortDesc />
												)}
												<span className='sr-only'>
													Change order
												</span>
											</Button>
										</TooltipTrigger>
										<TooltipContent>
											<p>Change sorting order</p>
										</TooltipContent>
									</Tooltip>
								</div>
							</>
						) : (
							<>
								{textHandlingUI()}
								{buttonHandlingUI()}
							</>
						)}
						{(message === '' ||
							message === 'Failed task, try later.') &&
							selectedFile !== null && (
								<Button
									variant='outline'
									size='icon'
									className='size-8 absolute top-2 right-2 cursor-pointer'
									onClick={handleResetClick}
								>
									<XCircle />
									<span className='sr-only'>Reset</span>
								</Button>
							)}
					</div>
				</div>
				{message === 'Task completed' && (
					<Collapsible
						open={isOpen}
						onOpenChange={setIsOpen}
						className='flex w-[100%] max-w-[350px] flex-col gap-2 mt-5 border border-[#bbb] rounded-md p-3 '
					>
						<div className='flex items-center justify-between gap-4 px-4'>
							<h3 className='text-md font-semibold'>
								Download data
							</h3>
							<CollapsibleTrigger asChild>
								<Button
									variant='ghost'
									size='icon'
									className='size-8 cursor-pointer'
								>
									<ChevronsUpDown />
									<span className='sr-only'>Toggle</span>
								</Button>
							</CollapsibleTrigger>
						</div>

						<CollapsibleContent className='flex flex-col gap-1'>
							<Button
								variant='outline'
								className={styles.productButtonDownload}
								onClick={() => {
									downloadFile(
										sortData(
											dataMails,
											sortingMethod,
											sortingOrder
										),
										'csv'
									);
								}}
							>
								Download CSV
								<DownloadIcon className='w-4 h-4 ml-1' />
							</Button>
							<Button
								variant='outline'
								className={styles.productButtonDownload}
								onClick={() => {
									downloadFile(
										sortData(
											dataMails,
											sortingMethod,
											sortingOrder
										),
										'json'
									);
								}}
							>
								Download JSON
								<DownloadIcon className='w-4 h-4 ml-1' />
							</Button>
							<Button
								variant='outline'
								className={styles.productButtonDownload}
								onClick={() => {
									downloadFile(
										sortData(
											dataMails,
											sortingMethod,
											sortingOrder
										),
										'xlsx'
									);
								}}
							>
								Download XLSX
								<DownloadIcon className='w-4 h-4 ml-1' />
							</Button>
						</CollapsibleContent>
					</Collapsible>
				)}
			</div>

			{/* Additional details */}

			<div className={styles.lightFour}></div>
			<div className={styles.lightFive}></div>
		</div>
	);
}
