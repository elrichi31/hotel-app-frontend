export const metadata = {
    title: 'Auth Layout',
}

const Layout = ({ children }: any) => {
    return (
        <div>
            <div className="font-sans text-gray-900 antialiased">
                <h1>Hola</h1>
                {children}
                <h1>hola</h1>
            </div>
        </div>
    )
}

export default Layout