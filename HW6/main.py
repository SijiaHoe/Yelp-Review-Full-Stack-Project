'''
Descripttion: 
version: 
Author: voanit
Date: 2022-09-10 10:44:00
LastEditors: voanit
LastEditTime: 2022-10-07 14:50:34
'''
from flask import Flask, current_app, request
import settings
import requests

app = Flask(__name__, static_url_path='')
app.config.from_object(settings)

api_key = 'Pd9flVvBPHTfYSIt-oxBK6Kd8FzFiQawIfOUN8LqlTb_ElsvnfVsZl_W7NrBUb_NxhHoQPB9SpwHP60vYlZSDnEDt4yB6D8MMlpPPT_ogpnvWgnpxRq21ckSsa89Y3Yx'
headers = {'Authorization': 'Bearer {}'.format(api_key)}
    
@app.route('/')
def home():
    return current_app.send_static_file('business.html')
# send_from_director

@app.route('/search', methods=["GET"])
def search():
    params = {}
    params["term"] = request.args.get("term")
    params["radius"] = request.args.get("radius")
    params["categories"] = request.args.get("categories")
    params["latitude"] = request.args.get("latitude")
    params["longitude"] = request.args.get("longitude")
    jsonData = callYelp(params)
    app.logger.info(type(jsonData))
    return jsonData


@app.route('/detail', methods=['GET'])
def detail():
    id = request.args.get("id")
    url = "https://api.yelp.com/v3/businesses/" + id
    response = requests.get(url, headers=headers, timeout = 5)
    jsonData = response.json()
    return jsonData


# yelp API
def callYelp(params):
    search_api_url = "https://api.yelp.com/v3/businesses/search"
    response = requests.get(search_api_url, headers=headers, params=params, timeout=5)
    
    # the dict output
    data_dict = response.json()
    # 'businesses', 'total', 'region'
    # app.logger.info(response.json().keys())
    # app.logger.info(data_dict['businesses']) 
    return data_dict['businesses']



if __name__ == '__main__':
        # app.run(debug=True)
        app.run()



