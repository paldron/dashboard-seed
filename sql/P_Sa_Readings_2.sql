CREATE PROCEDURE [dbo].[P_Sa_Readings_2]
	@from_date datetime = NULL,   
    @to_date datetime = NULL,
	@filter_type tinyint = NULL,
	@filter_val nvarchar(300) = NULL,
	@cust_type tinyint = NULL,
	@cust_sort tinyint = NULL,
	@start_date datetime = getdate
AS   

	SET NOCOUNT ON; 

	DECLARE @sql_string nvarchar(4000),
			@tariff_name nvarchar(100) = N'';

	SET @from_date = convert(varchar(30),concat(year(@start_date),IIF(month(@start_date) < 10,'-0','-'),month(@start_date),'-01'),23);
	IF @to_date IS NULL
		SET @to_date = @start_date;

	DECLARE @query  AS NVARCHAR(MAX), @cols AS NVARCHAR(MAX);
	select @cols = STUFF((SELECT ',' + QUOTENAME(concat('Day_',datepart(day,reading_date))) 
						FROM [dbo].connections
						WHERE reading_date >= @from_date
						Group by datepart(day,reading_date)
				FOR XML PATH(''), TYPE
				).value('.', 'NVARCHAR(MAX)') 
			,1,1,'');

	SET @sql_string =  N'SELECT sales_assistant_name, ' + @cols + N' from 
						 (
							  Select s.sales_assistant_name, count(c.connection_number) cons, concat(''Day_'',DATEPART(day,b.reading_date)) [Day]
							  From dbo.connections c
							  JOIN dbo.bills_history b
							  ON c.connection_number = b.account_number and b.reading_date between @from_date and @to_date
							  JOIN dbo.zone_and_route_def z 
							  ON c.zone_id = z.zone and c.route = z.route
							  RIGHT JOIN dbo.sales_assistants s
							  ON z.sa_id = s.sales_assistant_id
							  WHERE s.sales_assistant = 1 ';

	IF @filter_val IS NOT NULL
	BEGIN
		IF @filter_type = 1
			SET @sql_string = CONCAT(@sql_string,'AND c.connection_number = @filter_val ');
		IF @filter_type = 2
			SET @sql_string = CONCAT(@sql_string,'AND concat(z.[route],''_'',z.[zone]) = @filter_val ');
		IF @filter_type = 3
			SET @sql_string = CONCAT(@sql_string,'AND c.zone_id = @filter_val ');
		IF @filter_type = 5
			SET @sql_string = CONCAT(@sql_string,'AND z.sa_id = @filter_val ');
	END

	IF @cust_type IS NOT NULL
		BEGIN
			SET @sql_string = CONCAT(@sql_string,'AND c.category_id = @cust_type ');
			--SELECT @tariff_name = cust_type FROM dbo.tarrif WHERE id = @cust_type;
		END

	SET @sql_string  = CONCAT(@sql_string,N' Group by concat(''Day_'',DATEPART(day,b.reading_date)),s.sales_assistant_name ) x
												pivot 
												(
													sum(cons)
													for [Day] in (' + @cols + N')
												) p  ORDER BY sales_assistant_name');
    SET NOCOUNT OFF; 

	EXEC sp_executesql @sql_string,
					    N'@from_date datetime,   
						  @to_date datetime,
						  @filter_val nvarchar(300),
						  @cust_type tinyint,
						  @tariff_name nvarchar(100)',
						@from_date,@to_date,@filter_val,@cust_type,@tariff_name;