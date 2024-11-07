from json import loads
from pathlib import Path
import pandas as pd




filepath = 'C:\Temp\Python\\run_results_coverage_alias.json'
path = Path(filepath)
if path.exists():
    content = path.read_text()
    new_json = loads(content)
    result_row = {}
    results_data = []

    for i in range(len(new_json['results'])):
        
        result_row['unique_id']= new_json['results'][i]['unique_id']
        result_row['status'] = new_json['results'][i]['status']
        result_row['execution_time'] = new_json['results'][i]['execution_time']
        result_row['message'] = new_json['results'][i]['message']
        result_row['fail_rows'] = new_json['results'][i]['failures']
        result_row['table_name'] = new_json['results'][i]['relation_name']
        
        for j in range(len(new_json['results'][i]['timing'])):
            if new_json['results'][i]['timing'][j]['name'] == 'execute':
                result_row['start_time'] = new_json['results'][i]['timing'][j]['started_at']
                result_row['completed_time'] = new_json['results'][i]['timing'][j]['completed_at']
        
        
        results_data.append(result_row.copy())
        result_row.clear()
        
    
    # for k in range(len(results_data)):
    #     data = results_data[k]
    #     print (data['table_name'])
    
    # row = results_data[1]
    
    # for key in row.keys():
    #     print ('Klucz:' + key +'; Wartość: ' + row[key])
        

    

    
    # Create Dataframe
    
    df = pd.DataFrame.from_records(results_data)
    print(df[['status','table_name']])
    
        
# zapisac dane do dataframe
# zapisac dane do tabeli w Redshift        


