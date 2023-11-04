from flask import Flask, request, jsonify
from flask_cors import CORS
import openai

app = Flask(__name__)
CORS(app)

# 使用您的 OpenAI API 密钥进行初始化
openai.api_key = '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'

@app.route('/ask', methods=['POST'])
def ask_openai():
    user_message = request.json.get('message')
    if not user_message:
        return jsonify(error='No message provided'), 400

    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo", 
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": user_message}
        ]
    )
    
    assistant_response = response['choices'][0]['message']['content'].strip()
    
    # 返回用户的消息和聊天助手的回复
    return jsonify(user_message=user_message, assistant_message=assistant_response)

if __name__ == "__main__":
    app.run(debug=True, port=5000)
