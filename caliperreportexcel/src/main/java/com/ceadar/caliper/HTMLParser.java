package com.ceadar.caliper;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.apache.poi.hssf.usermodel.HSSFRow;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.Cell;
public class HTMLParser {
	
	private static HSSFWorkbook workbook = new HSSFWorkbook();
	private static HSSFSheet caliperInfoSheet = workbook.createSheet("Caliper Info");
	private static HSSFRow rowSheet;
	private static int rowId = 0;
	
	public static void main(String[] args) throws IOException {
		// TODO Auto-generated method stub
		Properties property = new Properties();
		try {
			InputStream propertyInputStream = new FileInputStream("resources/caliperreportexcel.properties");
			property.load(propertyInputStream);
		}catch(FileNotFoundException ex) {
			System.out.println("Property file not found");
			return;
		}
		String searchQuery = property.getProperty("caliperReport.search");
		
		File inputReportPath = new File("resources/reports");
		if(inputReportPath.exists() && inputReportPath.isDirectory()) {
			if(inputReportPath.listFiles().length>0) {
				//Process the each report file in the given path
				for(File inputReport : inputReportPath.listFiles())
					processReportFile(inputReport,searchQuery);
				
				FileOutputStream outputExcel = new FileOutputStream(new File("resources/reportWorkSheet/Writesheet.xls"));
				workbook.write(outputExcel);
				workbook.close();
				outputExcel.close();
				System.out.println("Report conversion to excel completed");
			}else {
				System.out.println("No reports found at ./reports");
			}
			
			
		}else {
			System.out.println("Report file directory not found");
			return;
		}
		
	}
	
	public static void processReportFile(File inputReport, String searchQuery) throws IOException {
		
		Document htmlDocument = Jsoup.parse(inputReport, "UTF-8");
		
		//String title = htmlDocument.title();
		//Elements bodyElement  = htmlDocument.select("body");
		
		Elements benchmarksummary = htmlDocument.select(searchQuery);
        Element tableBody = benchmarksummary.select("tbody").first();
		Elements tableRows = tableBody.getElementsByTag("tr");
		
		
		for(Element tableRow: tableRows) { 
			 rowSheet = caliperInfoSheet.createRow(rowId);
			 
			 Elements tableHead = tableRow.getElementsByTag("th");
			 Elements tableData = tableRow.getElementsByTag("td");
			 
			 // Check for the rowID is 0 to ensure the header is written only once
			 if(rowId==0 && !tableHead.isEmpty()) {
				parseRow(tableHead);
			 }else if(!tableData.isEmpty()) {
				 parseRow(tableData);
			 }else
				 continue;
			 
			 rowId++;
		} 
	}
	
	public static void parseRow(Elements htmlElements)
	{	
		int cellId = 0;
		//StringBuffer row = new StringBuffer();
		
		for (Element data: htmlElements) {
			 //row.append(data.text());
			 //row.append(",");
			 
			Cell cell = rowSheet.createCell(cellId);
			 
			// Condition check to parse the report value numbers
			 if(cellId ==0 || rowId ==0)
				 cell.setCellValue(data.text());
			 else
				 cell.setCellValue(Double.parseDouble(data.text()));
			 cellId ++;
			 
		 }
		 //row.deleteCharAt(row.length()-1);
		 //System.out.println(row.toString());
	}

}
