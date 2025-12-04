

export default function Header() {
    
    return (
        <div>
           <div className="w-full">
                {/* TOP GRADIENT + CURVE */}
                <div className="w-screen h-56 bg-gradient-to-b from-indigo-500 to-blue-700 flex items-end px-6 pb-10 overflow-hidden justify-center">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-500 to-emerald-400 bg-clip-text text-transparent">
                        Welcome
                    </h1>
                </div>
            </div>


                {/* Green curve
                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-[140%] h-32 bg-emerald-400 rounded-full" /> */}
            
        </div>
    )
}