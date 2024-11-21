export const metadata = {
    title: 'Auth Layout',
}

const Layout = ({ children }: any) => { 
    return (
        <div>
            <div>
                {children}
            </div>
        </div>
    )
}

export default Layout