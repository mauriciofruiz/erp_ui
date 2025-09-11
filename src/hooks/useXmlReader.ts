import { ChangeEvent, useState } from 'react';
import xml2js from 'xml-js';

export const useXmlReader = () => {
  const [xmlData, setXmlData] = useState<any>(null);

  const handleXmlFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const xmlText = e.target.result.toString();
          let decodedXmlText = xmlText;
          // Check if encoded characters exist before replacing
          if (/&lt;|&gt;/g.test(xmlText)) {
            decodedXmlText = xmlText
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>');
          } else {
            decodedXmlText = xmlText
              .replace('<![CDATA[', '')
              .replace(']]>', '');
          }
          const jsonData = xml2js.xml2json(decodedXmlText, {
            compact: true,
            spaces: 4,
          });
          setXmlData(JSON.parse(jsonData));
        }
      };
      reader.readAsText(file);
    }
  };

  return { xmlData, setXmlData, handleXmlFile };
};
