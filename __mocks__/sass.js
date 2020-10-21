const sass = jest.createMockFromModule('sass');

const renderSync = () =>{
    const result = {
        css: Buffer.from("h1{color: aquablue;}")
    }
    return result
}

sass.renderSync = renderSync

module.exports = sass