export const metadata = {
    title: 'Auth Layout',
}

const Layout = ({ children }: any) => {
    return (
        <div>
            <div className="font-sans text-gray-900 antialiased">
                {children}
            </div>
        </div>
    )
}

export default Layout