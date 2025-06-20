export const downloadFile = (data: Object[]) => {
    const csvRows = data.map((item: any) => Object.values(item));
    const csvContent = [
        Object.keys(data[0]).join(","),
        ...csvRows.map((row) => row.join(","))
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "companies.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, 0);
}