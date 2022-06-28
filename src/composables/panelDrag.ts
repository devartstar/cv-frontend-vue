export default function onDragging({ movementX, movementY }) {
    let panelEle = document.querySelector('.draggable-panel')
    let panelDimensions = panelEle?.getBoundingClientRect()
    let leftPos = panelDimensions?.left + movementX
    if (leftPos < 0) leftPos = 0
    if (leftPos > window.innerWidth - panelDimensions?.width)
        leftPos = window.innerWidth - panelDimensions?.width
    let topPos = panelDimensions?.top + movementY
    if (topPos < 0) topPos = 0
    if (topPos > window.innerHeight - panelDimensions?.height)
        topPos = window.innerHeight - panelDimensions?.height
    panelEle.style.left = `${leftPos}px`
    panelEle.style.top = `${topPos}px`
}
