

const PrivacyStatement = () => {

  return (
    <div>
      {/* Button to open the privacy statement */}

        <div className=" inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50 w-full p-4">
          <div className="bg-white rounded-lg p-6  w-full md:w-3/4 lg:w-1/2">
            <h2 className="text-2xl font-bold mb-4">Privacy Statement</h2>
            <p className="text-sm mb-4">Effective Date: April 7th 2025</p>
            
            <p className="mb-4">
              I, <strong>Alessio Massimo Giovannini</strong>, the owner of this demo tool, value your privacy and am committed to protecting the personal information you share with me. This privacy statement outlines how I collect, use, and safeguard your information when you use the demo version of <strong>AIDocExtractor</strong>.
            </p>

            <h3 className="font-semibold mt-4">Information I Collect</h3>
            <p className="mb-4">
              For the time being, I collect only your <strong>email address</strong> when you sign in or register with the platform. This information is used to authenticate your account and provide you with access to the demo services.
            </p>
            <p className="mb-4">
              In addition to the email address, my website may automatically collect certain technical information when you visit, such as your browser type, device type, and IP address. This information is typically used for functionality purposes, to improve the website's performance, and to enhance your overall user experience.
            </p>

            <h3 className="font-semibold mt-4">How I Use Your Information</h3>
            <p className="mb-4">
              I use the email address you provide to:
            </p>
            <ul className="list-disc ml-6 mb-4">
              <li>Create and manage your account.</li>
              <li>Authenticate your login credentials.</li>
              <li>Communicate with you regarding updates, service changes, or other relevant matters.</li>
            </ul>
            <p className="mb-4">I do <strong>not</strong> sell or rent your personal information to third parties. I may use third-party tools, such as cookies, analytics, or marketing platforms, which may collect additional information automatically for site functionality, user experience improvement, and data analytics.</p>

            <h3 className="font-semibold mt-4">Document Handling in the Demo</h3>
            <p className="mb-4">
              If you send documents for processing as part of the demo:
            </p>
            <ul className="list-disc ml-6 mb-4">
              <li><strong>Temporary Storage</strong>: The documents you upload are stored <strong>only temporarily</strong> during the processing transaction and are <strong>immediately removed</strong> after the transaction is complete.</li>
              <li><strong>No Retention</strong>: I do not retain any of the documents or data you send beyond the life of the transaction. Once the process is finished, all data is deleted, ensuring your documents are not stored long-term.</li>
            </ul>

            <h3 className="font-semibold mt-4">Data Sent to the LLM Model</h3>
            <p className="mb-4">
              The data you send to the <strong>Large Language Model (LLM)</strong> for processing is used exclusively for the purpose of extracting data. The data is <strong>not used in any way to retrain or improve</strong> the LLM. The LLM processes the data only for the duration of the transaction and does not retain any information once the transaction is completed.
            </p>

            <h3 className="font-semibold mt-4">Cookies and Other Tracking Technologies</h3>
            <p className="mb-4">
              My website may use cookies or other tracking technologies to enhance your user experience. Cookies are small files placed on your device that help remember your preferences and improve the website’s performance. You have the option to disable cookies through your browser settings, but please note that doing so may impact your ability to access certain features of the site.
            </p>

            <h3 className="font-semibold mt-4">Security of Your Information</h3>
            <p className="mb-4">
              I take the security of your personal information seriously and employ a variety of technical, administrative, and physical safeguards to protect it from unauthorized access, disclosure, alteration, or destruction. However, please be aware that no method of transmitting data over the internet or storing data is completely secure, and I cannot guarantee absolute security.
            </p>

            <h3 className="font-semibold mt-4">Your Rights</h3>
            <p className="mb-4">
              You have the right to:
            </p>
            <ul className="list-disc ml-6 mb-4">
              <li>Access the personal information I hold about you.</li>
              <li>Request that I update or correct any information I have about you.</li>
              <li>Request the deletion of your account and personal information, subject to any legal or contractual obligations.</li>
            </ul>
            <p className="mb-4">To exercise these rights, please contact me at <strong>alessiogiovannini23@gmail.com</strong>.</p>

            <h3 className="font-semibold mt-4">Third-Party Services</h3>
            <p className="mb-4">
              My website may integrate with third-party services for the purposes of analytics, functionality, and user experience. These services may collect and process data on my behalf. However, I do not control the privacy practices of these third-party services, and I encourage you to review their privacy policies.
            </p>

            <h3 className="font-semibold mt-4">Changes to This Privacy Statement</h3>
            <p className="mb-4">
              I reserve the right to update or modify this privacy statement at any time. Any changes will be posted on this page, and the "Effective Date" will be updated accordingly. I encourage you to review this statement periodically to stay informed about how I am protecting your information.
            </p>

            <h3 className="font-semibold mt-4">Contact Me</h3>
            <p className="mb-4">
              If you have any questions or concerns about this privacy statement or my privacy practices, please contact me at:
            </p>
            <p>
              <strong>Email:</strong> alessiogiovannini23@gmail.com
            </p>
        

          </div>
        </div>
   
    </div>
  );
};

export default PrivacyStatement;
