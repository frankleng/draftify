import { createContext } from 'react'
import '../styles/globals.css'
import '../styles/editorTheme.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { Provider } from 'react-redux'
import { useEffect, useState } from 'react'
import { store } from '../src/redux/store'
import { useRouter } from 'next/router'

export default function App({ Component, pageProps }: AppProps) {
	const router = useRouter()
	const [isElectron, setIsElectron] = useState(false)

	useEffect(() => {
		if (!window?.electronAPI) router.push('/404', undefined, { shallow: true })
		setIsElectron(!!window?.electronAPI)
	}, [router])

	return (
		<Provider store={store}>
			{isElectron ? (
				<WorkspaceLayout>
					<Component {...pageProps} />
				</WorkspaceLayout>
			) : (
				<Component {...pageProps} />
			)}
			<Head>
				<title>Journal</title>
				<meta name='description' content='My journal app' />
				<link rel='icon' href='/favicon.ico' />
			</Head>
		</Provider>
	)
}

import { useAppDispatch, useAppSelector } from '../src/redux/hooks'
import { fetchAllNotes } from '../src/redux/notes-slice'
import { Navigator } from '../src/components/Navigator'
import { Spinner } from '../src/components/Spinner'

type WorkspaceLayoutProps = {
	children: React.ReactNode
}

export const NotesContext = createContext<NoteList | undefined>(undefined)

function WorkspaceLayout(props: WorkspaceLayoutProps) {
	const [allNotes, setAllNotes] = useState<NoteList>()

	useEffect(() => {
		window.electronAPI!.getAllNotes().then((allNotes) => {
			console.log({ notes: allNotes })
			setAllNotes(allNotes)
		})
	}, [])

	return (
		<div className='h-screen flex flex-col'>
			<div className='webkit-app-drag h-7 w-full' />

			<div className='flex grow'>
				{/* check that initial data has been fetched */}
				{allNotes &&
					Object.keys(allNotes) &&
					Object.keys(allNotes).length > 0 && (
						<Navigator
							notesIdList={
								Object.keys(allNotes).sort().reverse() as Note['id'][]
							}
						/>
					)}
				<NotesContext.Provider value={allNotes}>
					{props.children}
				</NotesContext.Provider>
			</div>
			{
				//  (
				// 	<div className='h-full w-full flex items-center justify-center'>
				// 		<Spinner />
				// 	</div>
				// )
			}
		</div>
	)
}
