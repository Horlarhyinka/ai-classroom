'use client'

import { useSession } from "../../../utils/hooks/useSession";
import SignInPage from "./SignInPage";
import { Suspense } from "react";

const Page = () =>{
    const {session, loading} = useSession()
    return <Suspense><SignInPage sessionData={{data: session, loading}} /></Suspense>
}



export default Page