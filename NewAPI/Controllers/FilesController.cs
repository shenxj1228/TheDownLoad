using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.IO;
using TheDownLoad.Models;
using System.Xml.Linq;
using System.Net.Http.Headers;
using System.Configuration;
using ICSharpCode.SharpZipLib.Zip;
using System.Web;
using System.Text;

namespace TheDownLoad.Controllers
{
    public class FilesController : ApiController
    {
        // GET api/<controller>
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        private string rootFolder = (ConfigurationManager.AppSettings["rootFolder"].EndsWith("\\")) ? ConfigurationManager.AppSettings["rootFolder"].Remove(ConfigurationManager.AppSettings["rootFolder"].LastIndexOf('\\')) : ConfigurationManager.AppSettings["rootFolder"];
        private int maxSize = Convert.ToInt32(ConfigurationManager.AppSettings["maxSize"]);
        private int maxCount= Convert.ToInt32(ConfigurationManager.AppSettings["maxCount"]);

        /// <summary>
        /// 获得最大压缩文件的尺寸和数量
        /// </summary>
        /// <returns>{maxSize:5,maxCount:10}</returns>
        [HttpGet]
        [ActionName("getZipMax")]
        public string getZipMax()
        {
            try
            {
                return "{maxSize:" + maxSize + ",maxCount:" + maxCount + "}";
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        // GET api/<controller>/5
        /// <summary>
        /// 获得文件内容列表
        /// </summary>
        /// <param name="filepath"></param>
        /// <returns></returns>
        [HttpGet]
        [ActionName("getlist")]
        public string GetList(string filepath)
        {
            try
            {
                
                filepath = (filepath == null) ? rootFolder : Uri.UnescapeDataString(filepath);
                var folders = System.IO.Directory.EnumerateDirectories(filepath, "*", System.IO.SearchOption.TopDirectoryOnly).Where(directoryinfo => (File.GetAttributes(directoryinfo) & FileAttributes.System) != FileAttributes.System).Where(directoryinfo => (File.GetAttributes(directoryinfo) & FileAttributes.Hidden) != FileAttributes.Hidden).Select(path => new FileProperty { path = path, name = new DirectoryInfo(path).Name, size = "-1" }).ToList();

                var files = System.IO.Directory.EnumerateFiles(filepath, "*", System.IO.SearchOption.TopDirectoryOnly).Where(fileinfo => (File.GetAttributes(fileinfo) & FileAttributes.System) != FileAttributes.System).Where(fileinfo => (File.GetAttributes(fileinfo) & FileAttributes.Hidden) != FileAttributes.Hidden).Select(path => new FileProperty { path = path, name = new FileInfo(path).Name, size = (new FileInfo(path).Length).ToString()}).ToList();

                string strJson = "{\"status\":\"success\",\"rootfolder\":\"" + rootFolder.Replace("\\", "\\\\") + "\"," + "\"content\":{" + "\"folders\":" + ObjToJson<List<FileProperty>>(folders) + ",\"files\":" + ObjToJson<List<FileProperty>>(files) + "}}";

                return strJson;
            }
           
                catch(Exception e)
            {
                string strJson = "{\"status\":\"failed\",\"rootfolder\":\"\"," + "\"content\":\"" + e.Message.Replace("\\", "\\\\") + "\"}";
                return strJson;
            }
            
            
        }
        
        /// <summary>
        /// 通过后缀名称查询文件类型
        /// </summary>
        /// <param name="xmlpath"></param>
        /// <returns></returns>
        //[NonAction]
        //private string SearchfromXml(string hzmc)
        //{
        //    string result;
        //    IEnumerable<XAttribute> filetype = from ele in xe.Elements("filetype").Elements("hz").Where(e => e.Value == hzmc) select ele.Parent.Attribute("type");
        //    result = (filetype.FirstOrDefault() == null) ? "other" : filetype.FirstOrDefault().Value;
        //    return result;
        //}
        [NonAction]
        public static string ObjToJson<T>(T data)
        {
            try
            {
                System.Runtime.Serialization.Json.DataContractJsonSerializer serializer = new System.Runtime.Serialization.Json.DataContractJsonSerializer(data.GetType());
                using (MemoryStream ms = new MemoryStream())
                {
                    serializer.WriteObject(ms, data);
                    return System.Text.Encoding.UTF8.GetString(ms.ToArray());
                }
            }
            catch
            {
                return null;
            }
            
        }
        [HttpGet]
        [ActionName("download")]
        public HttpResponseMessage DownLoad(string filepath,string idel)
        {

            try
            {
                filepath = Uri.UnescapeDataString(filepath);  
                string customFileName = Path.GetFileName(filepath);//客户端保存的文件名
                HttpResponseMessage response = new HttpResponseMessage();
                if (idel == "1")
                {
                    byte[] data = File.ReadAllBytes(filepath);
                    MemoryStream ms = new MemoryStream(data);
                    response.Content = new StreamContent(ms);
                }
                else
                {
                    
                    FileStream fs = new FileStream(filepath, FileMode.Open, FileAccess.Read, FileShare.Read);
                    response.Content = new StreamContent(fs);
                }
                response.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment");
                response.Content.Headers.ContentDisposition.FileName = customFileName;
                response.Content.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");  // 这句话要告诉浏览器要下载文件
                response.Content.Headers.ContentLength = new FileInfo(filepath).Length;
                if (idel == "1"&&File.Exists(filepath))
                {
                    File.Delete(filepath);
                }
                return response;
        
                
            }
            catch(System.IO.IOException e)
            {

                return Request.CreateResponse(e);
            }
        }

        /// <summary>
        /// 获得文件夹节点
        /// </summary>
        /// <param name="filepath"></param>
        /// <returns></returns>
        [HttpGet]
        [ActionName("getnode")]
        public string GetNode(string filepath)
        {
            try
            {

                filepath = Uri.UnescapeDataString(filepath);  
                 filepath = (filepath == null) ? rootFolder : (filepath);

                 var folders = System.IO.Directory.EnumerateDirectories(filepath, "*", System.IO.SearchOption.TopDirectoryOnly).Where(directoryinfo => (File.GetAttributes(directoryinfo) & FileAttributes.System) != FileAttributes.System).Where(directoryinfo => (File.GetAttributes(directoryinfo) & FileAttributes.Hidden) != FileAttributes.Hidden).Select(path => new TreeNode { isParent = true, filepath = path, name = new DirectoryInfo(path).Name }).ToList();
                 string strJson = "{\"status\":\"success\",\"rootfolder\":\"" + rootFolder.Replace("\\", "\\\\") + "\"," + "\"content\":{" + "\"folders\":" + ObjToJson<List<TreeNode>>(folders) + ",\"files\":{}}}";
                return strJson;
            }
            catch(Exception e)
            {
                string strJson = "{\"status\":\"failed\",\"rootfolder\":\"\"," + "\"content\":\"" + e.Message.Replace("\\", "\\\\") + "\"}";
                return strJson;
            }
            //return "[{name: '子节点1'},{name: '子节点2'}]";
        }

        [HttpGet]
        [ActionName("searchfile")]
        public string SearchFile(string strsearch,string strhz="*")
        {
            strsearch = Uri.UnescapeDataString(strsearch);
            strhz = Uri.UnescapeDataString(strhz); 
 
            try
            {
                string searchfolder;
                string searchfile;
                if (strhz == null) { 
                    searchfolder = "*" + strsearch + "*";
                    searchfile = "*" + strsearch + "*";
                    strhz = "";
                }
                else
                {
                    searchfolder = "*" + strsearch + "." + strhz + "*";
                    searchfile = "*" + strsearch + "." + strhz + "*";
                }

               
                // "*" + strsearch + "*.*"+strhz+"*"
                var folders = System.IO.Directory.EnumerateDirectories(rootFolder, searchfolder, System.IO.SearchOption.AllDirectories).Select(path => new FileProperty { path = @path, name = Path.GetFileName(path),size="-1" }).Where(filesystem => (File.GetAttributes(filesystem.path) & FileAttributes.System) != FileAttributes.System).Where(filesystem => (File.GetAttributes(filesystem.path) & FileAttributes.Hidden) != FileAttributes.Hidden).Where(file => new FileInfo(file.path).Name.IndexOf(strsearch) > -1 && (new FileInfo(file.path).Name.IndexOf(strhz) > -1 || strhz == "")).ToList();


                var files = System.IO.Directory.EnumerateFiles(rootFolder, searchfile, System.IO.SearchOption.AllDirectories).Select(path => new FileProperty { path = @path, name = Path.GetFileName(path),  size = (new FileInfo(path).Length).ToString() }).Where(filesystem => (File.GetAttributes(filesystem.path) & FileAttributes.System) != FileAttributes.System).Where(filesystem => (File.GetAttributes(filesystem.path) & FileAttributes.Hidden) != FileAttributes.Hidden).Where(file => new FileInfo(file.path).Name.IndexOf(strsearch) > -1 && (new FileInfo(file.path).Name.IndexOf(strhz) > -1 || strhz == "")).ToList();
                string strJson = "{\"status\":\"success\",\"rootfolder\":\"" + rootFolder.Replace("\\", "\\\\") + "\"," + "\"content\":{" + "\"folders\":" + ObjToJson<List<FileProperty>>(folders) + ",\"files\":" + ObjToJson<List<FileProperty>>(files) + "}}";
                
                return strJson;
            }
            catch (Exception e){
                string strJson = "{\"status\":\"failed\",\"rootfolder\":\"\"," + "\"content\":\"" + e.Message.Replace("\\", "\\\\") + "\"}";
                return strJson;
            }
            
        }

        [HttpPost]
        [ActionName("downloadzip")]
        public string DownloadZip([FromBody]string value)
        {
            try
            {
                value = Uri.UnescapeDataString(value);
                string[] filepaths = value.Split('|');
                string zipfile = HttpContext.Current.Server.MapPath("~/zip/"+DateTime.Now.ToString("yyyy-MM-dd-hh-mm-ss")+".zip");
                using (ZipFile zip = ZipFile.Create(zipfile))
                {
                    zip.BeginUpdate();
                    foreach (string filepath in filepaths)
                    {
                        if (filepath != "")
                        {
                            zip.Add(filepath);
                        }
                    }
                    zip.CommitUpdate();
                }
                return "{\"status\":\"success\",\"rootfolder\":\"" + zipfile.Replace("\\", "\\\\") + "\"," + "\"content\":[]}"; 
                
            }
            catch(Exception e)
            {
                return "{\"status\":\"failed\",\"rootfolder\":\"\"," + "\"content\":\""+e.Message.Replace("\\","\\\\")+"\"}"; 
            }
        }

        // POST api/<controller>
        public void Post([FromBody]string value)
        {
        }

        // PUT api/<controller>/5
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE api/<controller>/5
        public void Delete(int id)
        {
        }
    }
}